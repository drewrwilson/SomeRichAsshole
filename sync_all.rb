#!/usr/bin/ruby

require 'net/https'
require 'net/http'
require 'open-uri'
require 'json'
require 'erb'
require 'pp'

ENDPOINT = "https://pu2jh2b68k.execute-api.us-east-1.amazonaws.com/prod/somerichasshole"
ROOTDIR = File.expand_path(File.dirname(__FILE__))
ACTIONSTATIONS_FILES = %w(actionstations-browser.css actionstations-options.css actionstations.js actionstations-lib.js actionstations-popup-config.js actionstations-storage.js background.js jquery-3.1.1.min.js jquery.tcycle.js jquery-ui popup.html fb.png twitter.png fb-reverse.png twitter-reverse.png)

phrases = (JSON.parse(URI.parse(ENDPOINT).read))["body"]

DIRS = {
  "chrome" => "chrome.js",
  "firefox" => "firefox.js"#,
#  "safari/some-rich-asshole-safari.safariextension" => nil
}

content_script = File.read(ROOTDIR+"/content_script.js")
DIRS.each_pair { |subdir, template|
  puts "*******************************"
  puts "Installing "+ROOTDIR+"/"+subdir+"/phrases.js"
  File.open(ROOTDIR+"/"+subdir+"/phrases.js", "w+") { |fd|
    fd.puts "PHRASES = "+JSON.generate(phrases)+";\n"
  }
  as_src = "#{Etc.getpwuid(Process.uid).dir}/actionstations/#{subdir}"
  puts "Installing Action Stations components into #{ROOTDIR}/#{subdir}/"
  ACTIONSTATIONS_FILES.each { |as|
    `cp -va #{as_src}/#{as} #{ROOTDIR}/#{subdir}/`
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
    `cd #{ROOTDIR}/#{subdir} && /usr/bin/zip -r #{zipfile} *`
  end
}
