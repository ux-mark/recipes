# Recipe Website Build Issue on Vercel

## Error Encountered

While deploying the recipe website to Vercel, the build process failed with the following error:

```
Failed to compile.

./lib/recipes.ts
81:42  Error: 'normalizedName' is defined but never used.  @typescript-eslint/no-unused-vars

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
Error: Command "npm run build" exited with 1
```

## Analysis

The error is related to an ESLint rule `@typescript-eslint/no-unused-vars` that's flagging an unused variable in our `lib/recipes.ts` file. Specifically, the parameter `normalizedName` in the `getAllTags` function on line 81 is defined but never referenced in the function body.

This is occurring because of our recent changes to the tag handling system. When we updated the `getAllTags` function to use a more robust approach for tag normalization, we changed the implementation to store both normalized and original tag forms. In the process, we added a destructuring operation that includes `normalizedName` as a parameter, but we no longer use this variable directly in the function body.

## Solution

There are two viable solutions to fix this issue:

### 1. Remove or rename the unused parameter

```typescript
// Change this line:
return Object.entries(tagCounts).map(([normalizedName, data]) => ({
  
// To this (using underscore to indicate intentionally unused variable):
return Object.entries(tagCounts).map(([_, data]) => ({
```

This is the preferred solution as it explicitly indicates that we're aware the first parameter exists but we don't need to use it. The underscore (`_`) is a common convention in JavaScript/TypeScript to indicate an intentionally unused parameter.

### 2. Disable the ESLint rule for this specific line

```typescript
// Add a comment to disable the rule for just this line
// eslint-disable-next-line @typescript-eslint/no-unused-vars
return Object.entries(tagCounts).map(([normalizedName, data]) => ({
```

This solution allows us to keep the parameter name for documentation purposes while telling ESLint to ignore the warning.

## Implementation Plan

1. Open the `lib/recipes.ts` file
2. Locate the `getAllTags` function (around line 81)
3. Replace the destructuring parameter `normalizedName` with an underscore (`_`)
4. Save the file
5. Run a local build to verify the fix
6. Commit the changes
7. Redeploy to Vercel

## Why This is Happening in Production Only

This issue only appeared during the Vercel build because:

1. The Vercel build process is configured to treat ESLint warnings as errors, which is a good practice for maintaining code quality
2. We may have different ESLint configurations between development and production environments
3. The local development setup might be ignoring this specific ESLint rule or not treating warnings as errors

Having strict linting in the production build process is beneficial as it helps catch potential issues before they reach production. In this case, it's flagging dead code (unused variables) which is good practice to clean up for code maintainability and bundle size optimization.

## Long-term Recommendations

To avoid similar issues in the future:

1. Set up a pre-commit hook or CI check that runs ESLint with the same configuration as the production build
2. Consider running `next lint` locally before pushing changes to catch these issues early
3. Ensure development and production ESLint configurations are aligned

This will help catch linting errors earlier in the development process rather than during deployment.