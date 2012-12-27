module ExtJS
  class Filters
    class Error < StandardError; end

    TimeStamp = "@timestamp"

    def initialize(json)
      @filters = parse(json)
    end

    attr_reader :filters

    def parse(json)
      raise Error, "filters must be passed" unless json
      filters = ::JSON.parse(json, max_nesting: 2, symbolize_names: true)
      unless filters.is_a?(Array)
        raise Error, "invalid filters \"#{filters.inspect}\"" 
      end
      filters
    end

    private :parse

    # translate into elasticsearch query dsl filters
    def to_es
      raise ArgumentError, "filters must be Array: #{@filters}" unless @filters.is_a?(Array)

      @filters.map do |filter|
        property = filter[:property]
        value = filter[:value]
 
        raise Error, "invalid filter: #{filter}" unless property && value

        case property 
        when "time"
          if value.include?(",")
            from, to = value.split(",")
            {
              range: {
                TimeStamp => {
                  from: Integer(from),
                  to: Integer(to)
                }
              }
            }
          else
            {
              range: {
                TimeStamp => { from: Integer(value) }
              }
            }
          end
        when "message"
          {
            query: {
              query_string: {
                default_field: "message",
                default_operator: "and",
                query: value
              }
            }
          }
        else
          {
            query: {
              text: {
                "@fields.#{property}" => {
                  query: value,
                  operator: "or"
                }
              }
            }
          }
        end
      end
    end
  end
end
