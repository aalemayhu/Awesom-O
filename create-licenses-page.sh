#!/bin/bash - 

cat LICENSE.md

for f in `find node_modules -iname LICENS*`;
do
  echo -n "## "; echo `dirname $f`;
  echo
  cat $f
  echo
done
