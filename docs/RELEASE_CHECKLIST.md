# Release Checklist

## Before Release

- [ ] All tests pass: `npm run test`
- [ ] TypeScript compiles cleanly: `npm run typecheck`
- [ ] Linter passes: `npm run lint`
- [ ] Production build succeeds: `npm run build`
- [ ] CHANGELOG.md updated with release notes
- [ ] Version bumped in package.json

## After Release

- [ ] Tag the release: `git tag v<version>`
- [ ] Push tags: `git push --tags`
- [ ] Deploy to production
