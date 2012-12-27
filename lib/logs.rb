require "csv" #XXX: it may not be used.
require "pp" #XXX: for debug(pretty print)

module LeoTamer
  class Logs < Sinatra::Base
    # config
    Host = "localhost"
    Port = 9200
    MasterChartInterval = "hour"
    DetailChartInterval = "15m"

    # field
    TimeStamp = "@timestamp"

    configure do
      @@logs = ::LeoFS::Logs.new(Host, Port)
    end

    before do
      @filters = ExtJS::Filters.new(params[:filter]).to_es if params[:filter]
      @scroll_id = params[:scroll_id]
    end

    post "/logs.json" do
      @@logs.get_logs(@filters, @scroll_id).to_json
    end
 
    get "/logs_dl.json" do
      content_type "application/octet-stream" # make browsers open download dialog
      logs = @@logs.get_logs(@filters, @scroll_id)
      JSON.pretty_generate(logs) # it will be human readable
    end

#XXX: not used
=begin
    get "/logs.csv" do
      fields = get_logs(params[:filter])
      data = CSV.generate do |csv|
        fields.each do |field|
          csv << field.values
        end
      end
      return data
    end
=end

    get "/log_detail_chart.json" do # per 15 minute
      @@logs.histo_chart(DetailChartInterval, @filters)
    end
  
    get "/log_master_chart.json" do # per 1 hour
      @@logs.histo_chart(MasterChartInterval, @filters)
    end
  end
end
