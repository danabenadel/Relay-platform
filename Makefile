.PHONY: mobile run stop logs url build-apk start-all

# Lance ngrok et met à jour le .env
mobile:
	@pkill ngrok 2>/dev/null || true
	@ngrok http 8080 > /tmp/ngrok.log 2>&1 & sleep 3
	@NGROK_URL=$$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4); \
	echo "$$NGROK_URL" > .ngrok_url; \
	sed -i.bak "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=$$NGROK_URL/auth/oauth/google/callback|g" .env; \
	sed -i.bak "s|GITHUB_REDIRECT_URI=.*|GITHUB_REDIRECT_URI=$$NGROK_URL/auth/oauth/github/callback|g" .env; \
	sed -i.bak "s|NGROK_URL=.*|NGROK_URL=$$NGROK_URL|g" .env; \
	echo "\n$$NGROK_URL\n"

# Lance Flutter avec l'URL ngrok
run:
	@cd mobile && flutter run --dart-define=API_BASE_URL=$$(cat ../.ngrok_url)
