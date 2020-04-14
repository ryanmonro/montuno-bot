#!/bin/bash
find . -exec ffmpeg -i {} -c:a aac -b:a 192k ../{}.m4a \;
