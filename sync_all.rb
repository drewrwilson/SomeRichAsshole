#!/usr/bin/ruby

require 'net/https'
require 'net/http'
require 'open-uri'
require 'json'
require 'pp'

ENDPOINT = "https://pu2jh2b68k.execute-api.us-east-1.amazonaws.com/prod/somerichasshole"
ROOTDIR = File.expand_path(File.dirname(__FILE__))

phrases = (JSON.parse(URI.parse(ENDPOINT).read))["body"]

["source/chrome", "source/firefox/chrome/content", "source/safari/some-rich-asshole-safari.safariextension"].each { |subdir|
  File.open(ROOTDIR+"/"+subdir+"/phrases.json", "w+") { |fd|
    fd.puts "PHRASES = "+JSON.generate(phrases)+";\n"
  }
}
