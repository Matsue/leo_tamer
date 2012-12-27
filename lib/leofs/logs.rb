require "rubberband"

module LeoFS
  class Logs
    class Error < StandardError; end

    # config
    Host = "localhost"
    Port = 9200
    LogLevels = %w{fatal error warn info debug}
    ScrollTimeout = "5m"
    ScrollSize = 100
    MasterChartInterval = "hour"
    DetailChartInterval = "15m"
    TimeStamp = "@timestamp"

    def initialize(host, port)
      begin
        @client = ElasticSearch.new("http://#{host}:#{port}")
      rescue => ex
        raise Error, "can't connect to elasticsearch\n#{ex.inspect}"
      end
    end

    def init_scroll(es_query)
      @client.search(es_query, scroll: ScrollTimeout, size: ScrollSize)
    end
    
    def get_logs(filters, scroll_id)
      if scroll_id
        result = @client.scroll(scroll_id, scroll: ScrollTimeout)
      else
        es_query = create_logs_query(filters)
        result = init_scroll(es_query) 
        scroll_id = result.scroll_id
      end

      fields = result.hits.map! {|hit| hit._source["@fields"] }
      fields.each do |log| 
        message = log["message"]
        message.replace("<pre>#{message}</pre>")
      end

      { data: fields, scroll_id: scroll_id }
    end

    def create_logs_query(filters)
      {
        sort: [TimeStamp],
        query: {
          filtered: {
            filter: { and: filters },
            query: { match_all: {} }
          }
        }
      }
    end

    def histogram(interval, filters=nil)
      histo_query = {
        size: 0,
        query: {
          filtered: {
            filter: { and: filters },
            query: { match_all: {} }
          }
        },
        facets: {}
      }

      LogLevels.each do |level|
        level_filter = {
          query: {
            text: {
              "@fields.log_level" => level.capitalize
            }
          }
        }

        histo_query[:facets][level.to_sym] = {
          date_histogram: {
            field: TimeStamp,
            interval: interval
          },
          facet_filter: level_filter
        }
      end

      @client.search(histo_query).facets
    end

    # convert ES style interval (hour, 15m, 30m ...) to Integer
    def get_interval(str_interval)
      case str_interval
      when "hour"
        60 * 60 * 1000
      when /^([0-9]+)m$/ # some minutes (15m, 30m ...)
        60 * Integer($1) * 1000
      else
        raise Error, "invalid interval \"#{str_interval}\""
      end
    end

    # fill in histo data with zero to avoid highcharts' bug
    def histo_to_chart_data(histo, str_interval)
      if LogLevels.all? {|level| histo[level]["entries"].empty? } # no data
        return LogLevels.map { [] }
      end

      entries = LogLevels.map {|level| histo[level]["entries"] }
      time = entries.flat_map do |entry|
        entry.map{|h| h["time"] }
      end

      start, stop = time.minmax
      interval = get_interval(str_interval)
      timestamp_enum = (start..stop).step(interval)
      level_map = Hash.new(0) # set zero as default value

      entries.map! do |entry|
        entry.each do |h|
          level_map[h["time"]] = h["count"]
        end
        data = timestamp_enum.map do |time|
          { x: time, y: level_map[time] }
        end
        level_map.clear
        data
      end
    end

    def histo_chart(interval, filters)
      histo = histogram(interval, filters)
      histo_to_chart_data(histo, interval).to_json
    end
  end
end
