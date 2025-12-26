FROM --platform=linux/arm64 cirrusci/flutter:stable AS build

ARG API_BASE_URL=http://localhost:8080

WORKDIR /app
COPY . .

RUN flutter pub get

RUN flutter build apk --debug \
    --dart-define=API_BASE_URL=${API_BASE_URL}

FROM alpine:3.19
RUN mkdir -p /out
COPY --from=build /app/build/app/outputs/flutter-apk/app-debug.apk /out/area-client.apk
CMD ["sh", "-c", "ls -lh /out && echo 'APK prêt dans /out' && tail -f /dev/null"]
