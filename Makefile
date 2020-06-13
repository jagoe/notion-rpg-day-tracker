clean:
	rm dist/*

build: clean
	7z a -tzip -x!dist -x!.gitignore -x!.git -x!Makefile -x!README.md dist/notion-rpg-day-tracker.zip .
