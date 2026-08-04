Remove-Item -Recurse -Force tmp-zip -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path tmp-zip
Copy-Item -Path backend, frontend, backend-node, README.md, schema.sql -Destination tmp-zip -Recurse
Remove-Item -Recurse -Force tmp-zip\frontend\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force tmp-zip\backend-node\node_modules -ErrorAction SilentlyContinue
Compress-Archive -Path tmp-zip\* -DestinationPath it-asset-tracker.zip -Force
Remove-Item -Recurse -Force tmp-zip
