require "sinatra/base"
require "json"
require "haml"
require "coffee-script"
require "coffee-filter"
require "rack/test"

require_relative "../lib/config"

include Rack::Test::Methods

def get_json(url)
  get url
  @data = JSON.parse(last_response.body.to_s)
end
