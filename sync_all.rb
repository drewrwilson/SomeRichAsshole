#!/usr/bin/ruby

require 'net/https'
require 'net/http'
require 'open-uri'
require 'json'
require 'erb'
require 'pp'

ENDPOINT = "https://pu2jh2b68k.execute-api.us-east-1.amazonaws.com/prod/somerichasshole"
ROOTDIR = File.expand_path(File.dirname(__FILE__))

phrases = (JSON.parse(URI.parse(ENDPOINT).read))["body"]

DIRS = {
  "source/chrome" => "chrome.js",
  "source/firefox/chrome/content" => "firefox.js",
  "source/safari/some-rich-asshole-safari.safariextension" => nil
}

content_script = File.read(ROOTDIR+"/content_script.js")
DIRS.each_pair { |subdir, template|
  puts "Installing "+ROOTDIR+"/"+subdir+"/phrases.json"
  File.open(ROOTDIR+"/"+subdir+"/phrases.json", "w+") { |fd|
    fd.puts "PHRASES = "+JSON.generate(phrases)+";\n"
  }
  if !template.nil?
    puts "Generating "+ROOTDIR+"/"+subdir+"/content_script.js"
    erb = ERB.new(File.read(ROOTDIR+"/"+template))
    File.open(ROOTDIR+"/"+subdir+"/content_script.js", "w+", 0644) { |f|
      f.puts erb.result(binding)
    }
    zipfile = "#{Etc.getpwuid(Process.uid).dir}/SomeRichAsshole-#{template.sub(/\.js$/, "")}.zip"
    File.unlink(zipfile) if File.exists?(zipfile)
    puts "Creating #{zipfile}"
    `cd #{ROOTDIR}/source/#{template.sub(/\.js$/, "")} && /usr/bin/zip -r #{zipfile} *`
  end
}
