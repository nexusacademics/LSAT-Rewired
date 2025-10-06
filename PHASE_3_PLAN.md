# Phase 3: Remove Old useTestData Hook

## Goal
Remove the old useTestData hook that loads all tests upfront, since it's no longer needed. The new hooks handle everything.

## Components That Use allProcessedTests

Need to check these files:
1. App.tsx - Uses for Dashboard and FloatingChatButton
2. Dashboard.tsx - Uses for search functionality
3. FloatingChatButton - Uses for AI chat context

## Changes Needed

### 1. Update Dashboard Search
- Currently uses allProcessedTests for search
- Will move to Phase 4 (server-side search)
- For now, keep minimal functionality

### 2. Update FloatingChatButton  
- Currently receives allProcessedTests
- Only needs current test data
- Update to receive currentTestData instead

### 3. Remove useTestData from App.tsx
- Remove import
- Remove hook call
- Remove allProcessedTests state
- Update Dashboard props

## Strategy
Since search is complex, we'll:
1. Keep useTestData for Dashboard search (temporarily)
2. Remove it from TripleReview flow completely
3. Handle search in Phase 4 with server-side queries
