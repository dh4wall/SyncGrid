# Optimistic Updates - Kanban Card Fix

## Problem
When updating a card's title, description, or color, the `onRefresh()` callback would trigger a full board reload from the database. This caused cards to jump back to their database positions, losing any visual state from recent drag operations that hadn't been saved yet.

## Solution
Implemented optimistic UI updates that immediately reflect changes in the UI without requiring a full page refresh.

### Changes Made

#### 1. **Updated `updateCard` Action** (`lib/actions/boards.ts`)
- Modified to only call `revalidatePath()` for position/column changes (drag operations)
- Title, description, and color updates no longer trigger path revalidation
- This prevents unnecessary full page refreshes

```typescript
// Only revalidate for position/column changes (drag operations)
if (data.columnId !== undefined || data.position !== undefined) {
  revalidatePath(`/projects/${data.projectId}/board`);
}
```

#### 2. **Added Optimistic Update Handler** (`board/page.tsx`)
- Created `handleCardUpdate()` function that updates local board state immediately
- Updates the card in the state without reloading from database
- Changes are instantly visible to the user

```typescript
const handleCardUpdate = (cardId: string, updates: { title?: string; description?: string; color?: string }) => {
  setBoard((prevBoard: any) => {
    if (!prevBoard) return prevBoard;
    
    return {
      ...prevBoard,
      columns: prevBoard.columns.map((col: any) => ({
        ...col,
        cards: col.cards.map((card: any) =>
          card.id === cardId ? { ...card, ...updates } : card
        ),
      })),
    };
  });
};
```

#### 3. **Updated KanbanColumn Component**
- Added `onUpdate` prop to the component interface
- Passes the callback down to child KanbanCard components

```typescript
interface KanbanColumnProps {
  // ...existing props
  onUpdate?: (cardId: string, updates: { title?: string; description?: string; color?: string }) => void;
}
```

#### 4. **Modified KanbanCard Component**
- Updated `handleSave()` to call `onUpdate()` before database update
- Updated `handleColorChange()` to call `onUpdate()` before database update
- `handleDelete()` still uses `onRefresh()` since deletion requires DOM updates

```typescript
const handleSave = async () => {
  if (title.trim()) {
    const updates = { title: title.trim(), description: description.trim() };
    
    // Optimistic update - UI changes immediately
    if (onUpdate) {
      onUpdate(card.id, updates);
    }
    
    // Database update happens in background
    await updateCard(card.id, { ...updates, projectId });
    setIsEditing(false);
  }
};

const handleColorChange = async (color: string) => {
  // Optimistic update - UI changes immediately
  if (onUpdate) {
    onUpdate(card.id, { color });
  }
  
  // Database update happens in background
  await updateCard(card.id, { color, projectId });
  setShowColorPicker(false);
};
```

## Bonus: Brighter Card Colors

Updated card colors from `50` shade to `200` shade for better visibility:
- **Before**: `bg-red-50`, `bg-blue-50`, etc. (very light/pale)
- **After**: `bg-red-200`, `bg-blue-200`, etc. (brighter/more vibrant)
- Border colors also updated from `200` to `400` for better contrast

```typescript
const CARD_COLORS = [
  { name: 'White', class: 'bg-white', border: 'border-gray-300' },
  { name: 'Red', class: 'bg-red-200', border: 'border-red-400' },
  { name: 'Orange', class: 'bg-orange-200', border: 'border-orange-400' },
  { name: 'Yellow', class: 'bg-yellow-200', border: 'border-yellow-400' },
  { name: 'Green', class: 'bg-green-200', border: 'border-green-400' },
  { name: 'Blue', class: 'bg-blue-200', border: 'border-blue-400' },
  { name: 'Purple', class: 'bg-purple-200', border: 'border-purple-400' },
  { name: 'Pink', class: 'bg-pink-200', border: 'border-pink-400' },
];
```

## Result
- ✅ Cards no longer jump to original positions after editing title/description
- ✅ Color changes are instantly visible without refresh
- ✅ Drag operations remain smooth and predictable
- ✅ Database is still updated correctly in the background
- ✅ Only delete operations trigger full board refresh (necessary for DOM changes)
- ✅ Cards are now more vibrant and easier to distinguish

## Files Modified
```
lib/actions/boards.ts                                  # Conditional revalidation
app/(dashboard)/projects/[id]/board/page.tsx          # Added handleCardUpdate
components/board/kanban-column.tsx                     # Added onUpdate prop
components/board/kanban-card.tsx                       # Optimistic updates + brighter colors
```
