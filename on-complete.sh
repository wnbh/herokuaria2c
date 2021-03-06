#!/bin/bash

filePath=$3

filepaths=${filePath%/*} # 删除路径中的文件名
filePaths=${filepaths#*downloads} # 删除路径中从左往右第一个downloads及其左边的路径

relativePath=${filePath#*downloads/}

LIGHT_GREEN_FONT_PREFIX="\033[1;32m"
FONT_COLOR_SUFFIX="\033[0m"
INFO="[${LIGHT_GREEN_FONT_PREFIX}INFO${FONT_COLOR_SUFFIX}]"

echo -e "$(date +"%m/%d %H:%M:%S") ${INFO} Delete .aria2 file ..."

if [ $2 -eq 0 ]; then
    exit 0
elif [ -e "${filepath}.aria2" ]; then
    rm -vf "${filepath}.aria2"
elif [ -e "${topPath}.aria2" ]; then
    rm -vf "${topPath}.aria2"
fi
echo -e "$(date +"%m/%d %H:%M:%S") ${INFO} Delete .aria2 file finish"
echo "$(($(cat numUpload)+1))" > numUpload # Plus 1

if [[ $2 -eq 1 ]]; then # 单文件
	rclone -v --config="rclone.conf" move "$3" "DRIVE:$RCLONE_DESTINATION/${filePaths#*/}" 2>&1	
elif [[ $2 -gt 1 ]]; then # 多文件
	rclone -v --config="rclone.conf" move "$filepaths" "DRIVE:$RCLONE_DESTINATION/${relativePath%%/*}"
fi

echo "$(($(cat numUpload)-1))" > numUpload # Minus 1
