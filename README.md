# EngageBoard

## Build

You may prepare the `server-info.sh` file at the root directory of the project for the build process as follows:

```bash
cat 'export SERVER_HOST="<Your server IP>"' > server-info.sh
cat 'export SERVER_PORT=<Your server port>' >> server-info.sh
```

Then

```
npm run release
```
