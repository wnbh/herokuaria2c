#!/bin/bash

# Install rclone static binary
wget -q https://downloads.rclone.org/v1.51.0/rclone-v1.51.0-linux-amd64.zip
unzip -q rclone-v1.51.0-linux-amd64.zip
export PATH=$PWD/rclone-v1.51.0-linux-amd64:$PATH

# Install aria2c static binary
wget https://github.com/P3TERX/aria2-builder/releases/download/1.35.0/aria2-1.35.0-static-linux-amd64.tar.gz
tar zxvf aria2-1.35.0-static-linux-amd64.tar.gz
sudo mv aria2c /usr/local/bin
export PATH=$PWD/aria2-1.35.0-static-linux-amd64:$PATH

# Create download folder
mkdir -p downloads

# DHT
wget -q https://github.com/P3TERX/aria2.conf/raw/master/dht.dat
wget -q https://github.com/P3TERX/aria2.conf/raw/master/dht6.dat

# Tracker
tracker_list=`curl -Ns https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all.txt | awk '$1' | tr '\n' ',' | cat`
echo "bt-tracker=$tracker_list" >> aria2c.conf
