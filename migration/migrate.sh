#!/bin/bash
url=''
user=''
password=''
host='localhost'
db=''
usage="$(basename "$0") [-h] [-u -p -h -d -url] -- Basic Mysql migrating tool.

where:
    -h  show this help text
    -u | --user  set mysql user @optional
    -p | --password set mysql password @optional
    -h | --host set mysql host binded @optional
    -d | --db set db @required
    -url mysql full url @optional"

while [ $# -gt 0 ]; do
  case "$1" in
    -url )            url=$2
                      shift
                      ;;
    -u | --user )     user=$2
                      shift
                      ;;
    -p | --password ) password=$2
                      shift
                      ;;
    -h | --host )     host=$2
                      shift
                      ;;
    -d | --db)        db=$2
                      shift
                      ;;
    -h | --help )     echo "$usage" >&2
                      exit 1
                      ;;
    * )               echo "$usage" >&2
                      exit 1
  esac
  shift
done

urllen=${#url}
dblen=${#db}
userlen=${#user}
passlen=${#password}
hostlen=${#host}

if [ $urllen == 0 ]; then
  if [ $userlen -gt 0 -a $passlen -gt 0 -a $hostlen -gt 0 -a $dblen -gt 0 ]; then
    url="mysql://$user:$password@$host:3306/$db?charset=utf8"
  else
    echo "$usage" >&2
    exit 1
  fi
fi

echo "URL       = $url"
echo "USER      = $user"
echo "PASSWORD  = $password"
echo "HOST      = $host"
echo "DB        = $db"

node migrate.js -url $url dbv && 
node migrate.js -url $url migrate