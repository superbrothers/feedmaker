#!/bin/zsh

ps aux | grep -v grep | grep "feedmaker/bin/dattorss.js"   | grep node | awk '{print $2}' | xargs kill -KILL
ps aux | grep -v grep | grep "feedmaker/bin/gistupload.js" | grep node | awk '{print $2}' | xargs kill -KILL

CURRENT_DIR=$(cd $(dirname $0);pwd)

cat $CURRENT_DIR/../conf/config | grep '	' | while read LINE; do

    BOARD=`echo $LINE | awk -F'	' '{print $1}'`
    THREAD=`echo $LINE | awk -F'	' '{print $2}'`
    RSS_NAME=`echo $LINE | awk -F'	' '{print $3}'`
    TITLE=`echo $LINE | awk -F'	' '{print $4}'`
    THREAD_URLENC=`echo $THREAD | nkf -eMQ | tr = % | sed 's/%20/+/g'`

    echo "FeedMaker : AUTO UPDATE TO : $THREAD : $TITLE"
    curl --url "http://www.domo2.net/search/search.cgi?word=${THREAD_URLENC}&tnum=200&sort=title" --silent | \
        iconv -f EUC-JP -t UTF-8 | \
        perl -ne 'print join("\n",$_=~m/(http:[^\"]+)/g),"\n"' | \
        grep -o -E "http.*$BOARD/[0-9]+" | head -n 10 | xargs -n 10 node $CURRENT_DIR/dattorss.js "$TITLE" > $CURRENT_DIR/../data/$RSS_NAME.rss
    node $CURRENT_DIR/gistupload.js "$TITLE" "$CURRENT_DIR/../data/$RSS_NAME.rss"
    sleep 5;
done
