# SyncGrid — System Diagrams (ASCII)

---

## 1. Entity-Relationship (ER) Diagram

```
┌─────────────────────────┐
│         profiles         │
│─────────────────────────│
│ PK  id          (uuid)  │
│     email       (text)  │
│     full_name   (text)  │
│     avatar_url  (text)  │
│     created_at  (ts)    │
│     updated_at  (ts)    │
└───────────┬─────────────┘
            │ 1
            │
            │ creates                                   invites
            │                               ┌─────────────────────────────┐
            ▼ N                             │                             │
┌─────────────────────────┐                ▼                             │
│         projects         │    ┌──────────────────────────┐             │
│─────────────────────────│    │      project_members      │             │
│ PK  id          (uuid)  │    │──────────────────────────│             │
│ FK  created_by  (uuid)  │◄───│ PK  id             (uuid)│             │
│     name        (text)  │    │ FK  project_id     (uuid)│             │
│     description (text)  │    │ FK  user_id        (uuid)│─────────────┘
│     icon        (text)  │    │ FK  invited_by     (uuid)│
│     color       (text)  │    │     role           (enum)│
│     created_at  (ts)    │    │     invited_email  (text)│
│     updated_at  (ts)    │    │     invitation_status    │
└───────┬─────────────────┘    │     invitation_token     │
        │                      │     joined_at      (ts)  │
        │                      │     invited_at     (ts)  │
        │                      └──────────────────────────┘
        │ 1
        ├───────────────────────────────────────────────────────┐
        │                                                       │
        │ N                                                     │ N
        ▼                                                       ▼
┌──────────────────────┐                        ┌──────────────────────────┐
│        boards        │                        │          pages           │
│──────────────────────│                        │──────────────────────────│
│ PK  id      (uuid)   │                        │ PK  id             (uuid)│
│ FK  project_id(uuid) │                        │ FK  project_id     (uuid)│
│     name    (text)   │                        │ FK  parent_id      (uuid)│
│     created_at (ts)  │                        │ FK  created_by     (uuid)│
│     updated_at (ts)  │                        │     title          (text)│
└──────────┬───────────┘                        │     content        (json)│
           │ 1                                  │     current_version (int)│
           │                                    │     created_at     (ts)  │
           │ N                                  │     updated_at     (ts)  │
           ▼                                    └────────────┬─────────────┘
┌──────────────────────┐                                     │ 1
│       columns        │                                     │
│──────────────────────│                                     │ N
│ PK  id      (uuid)   │                                     ▼
│ FK  board_id (uuid)  │                        ┌──────────────────────────┐
│     title   (text)   │                        │      page_versions       │
│     position (int)   │                        │──────────────────────────│
│     created_at (ts)  │                        │ PK  id             (uuid)│
└──────────┬───────────┘                        │ FK  page_id        (uuid)│
           │ 1                                  │ FK  created_by     (uuid)│
           │                                    │     version_number  (int)│
           │ N                                  │     title          (text)│
           ▼                                    │     content        (json)│
┌──────────────────────┐                        │     change_summary (text)│
│        cards         │                        │     created_at     (ts)  │
│──────────────────────│                        └──────────────────────────┘
│ PK  id       (uuid)  │
│ FK  column_id (uuid) │
│ FK  created_by(uuid) │                        ┌──────────────────────────┐
│     title    (text)  │                        │      notifications       │
│     description(text)│                        │──────────────────────────│
│     color    (text)  │                        │ PK  id             (uuid)│
│     position  (int)  │                        │ FK  user_id        (uuid)│
│     created_at (ts)  │                        │ FK  project_id     (uuid)│
│     updated_at (ts)  │                        │ FK  triggered_by   (uuid)│
└──────────────────────┘                        │     type           (enum)│
                                                │     title          (text)│
                                                │     message        (text)│
                                                │     read           (bool)│
                                                │     data           (json)│
                                                │     link           (text)│
                                                │     read_at        (ts)  │
                                                │     created_at     (ts)  │
                                                └──────────────────────────┘

Role ENUM:   owner | admin | editor | viewer
Status ENUM: pending | active | expired
Type ENUM:   team_invite | mention | major_change | card_assigned | comment
```

---

## 2. Sequence Diagram

### 2a. User Sign-Up & Login Flow
```
  Browser          Next.js             Middleware          Supabase Auth
     │                │                    │                    │
     │──── GET /signup──►                  │                    │
     │                │──── check session ►│                    │
     │                │◄── not logged in ──│                    │
     │◄── signup page ─│                   │                    │
     │                │                   │                    │
     │──── POST (email, password) ────────►│                    │
     │                │                   │──── signUp() ──────►│
     │                │                   │◄── user + session ──│
     │                │◄─── session cookie ──────────────────── │
     │◄── redirect /dashboard ────────────│                    │
     │                │                   │                    │
```

### 2b. Project Creation Flow
```
  User         Next.js App        createProject()      Supabase DB
   │                │                   │                   │
   │── Create Proj ─►                   │                   │
   │                │── auth.getUser() ─►                   │
   │                │◄─ user ───────────│                   │
   │                │── createProject() ►                   │
   │                │                  │── INSERT projects ─►
   │                │                  │◄─ project ─────────│
   │                │                  │── INSERT project_members (role: owner) ─►
   │                │                  │◄─ OK ──────────────────────────────────│
   │                │                  │── INSERT boards ───►
   │                │                  │◄─ board ───────────│
   │                │                  │── INSERT columns (To Do, In Progress, Done) ─►
   │                │                  │◄─ OK ──────────────────────────────────────────│
   │                │◄─ project data ───│                   │
   │                │── revalidatePath('/dashboard')        │
   │◄── redirect /dashboard ──────────────────────────────  │
```

### 2c. Member Invitation Flow
```
  Owner         inviteMemberByEmail()       Supabase DB         Invitee
    │                   │                       │                  │
    │── invite(email,role) ►                    │                  │
    │                   │── lookup profiles ────►                  │
    │                   │◄─ profile (or null) ──│                  │
    │                   │── check existing member ►               │
    │                   │◄─ result ─────────────│                  │
    │                   │── generate UUID token  │                  │
    │                   │── INSERT project_members (pending) ─────►│
    │                   │◄─ invitation_token ───│                  │
    │◄─ invitationToken │                       │                  │
    │                   │                       │                  │
    │── share link ─────────────────────────────────────────────►  │
    │                   │                       │    GET /invite?token=xxx
    │                   │                       │◄─────────────────│
    │                   │── acceptInvitation() ─►                  │
    │                   │── auth.getUser() ──────►                 │
    │                   │◄─ user ───────────────│                  │
    │                   │── find invitation by token ─────────────►│
    │                   │◄─ invitation record ──│                  │
    │                   │── UPDATE → status: 'active', user_id, joined_at ─►
    │                   │◄─ OK ─────────────────│                  │
    │                   │── revalidatePath('/dashboard') ──────────│
    │                   │                       │◄── redirect /dashboard
```

### 2d. Board Card Operations (Create / Move)
```
  User           Board UI          Server Action       Supabase DB
   │                │                   │                   │
   │── Add Card ───►│                   │                   │
   │                │── createCard() ──►│                   │
   │                │                  │── get max position ►
   │                │                  │◄─ position ────────│
   │                │                  │── INSERT cards ────►
   │                │                  │◄─ card ────────────│
   │                │◄─ card data ──────│                   │
   │                │                  │                   │
   │── Drag Card ──►│                   │                   │
   │                │── moveCard() ─────►                  │
   │                │ (optimistic UI)  │── get cards in src col ─►
   │                │                  │◄─ src cards ───────│
   │                │                  │── get cards in dst col ─►
   │                │                  │◄─ dst cards ───────│
   │                │                  │── UPDATE positions (src col) ─►
   │                │                  │── UPDATE positions (dst col) ─►
   │                │                  │── UPDATE card column_id ───────►
   │                │                  │◄─ OK ──────────────│
   │                │                  │── revalidatePath() │
   │◄── re-render ──│                  │                   │
```

### 2e. Real-Time Presence (Active Users)
```
  User A      Supabase Realtime     User B
    │                │                │
    │── subscribe channel ──────────► │
    │── broadcast presence ──────────►│
    │                │                │
    │                │── subscribe ───│
    │                │◄── presence ───│
    │◄── presence received ──────────│
    │                │                │
    │── heartbeat (30s) ─────────────►│
    │◄── other users present ─────────│
    │                │                │
    │── leave/unsubscribe ───────────►│
    │                │◄── user left ──│
```

---

## 3. UML Use Case Diagram

```
                        ┌─────────────────────────────────────────────────────────┐
                        │                     SyncGrid System                     │
                        │                                                         │
  ┌──────────┐          │  ┌──────────────────┐    ┌──────────────────────────┐  │
  │          │          │  │   Authentication  │    │    Project Management    │  │
  │  Guest   │──────────┼─►│  ● Sign Up        │    │  ● Create Project        │  │
  │  User    │          │  │  ● Login          │    │  ● View Projects         │  │
  └──────────┘          │  │  ● OAuth (Google) │    │  ● Delete Project        │  │
                        │  │  ● Logout         │    └──────────────────────────┘  │
                        │  └──────────────────┘                                   │
                        │                                                         │
  ┌──────────┐          │  ┌──────────────────┐    ┌──────────────────────────┐  │
  │          │          │  │   Page Editor     │    │    Board / Kanban        │  │
  │  Viewer  │──────────┼─►│  ● View Pages     │    │  ● View Board            │  │
  │          │          │  └──────────────────┘    │  ● View Cards            │  │
  └──────────┘          │                          └──────────────────────────┘  │
       │                │                                                         │
  ┌──────────┐          │  ┌──────────────────┐    ┌──────────────────────────┐  │
  │          │          │  │   Page Editor     │    │    Board / Kanban        │  │
  │  Editor  │──────────┼─►│  ● Create Page    │    │  ● Create Card           │  │
  │          │          │  │  ● Edit Page      │    │  ● Edit Card             │  │
  └──────────┘          │  │  ● Delete Page    │    │  ● Delete Card           │  │
       │                │  │  ● Restore Version│    │  ● Move Card (Drag)      │  │
       │                │  └──────────────────┘    └──────────────────────────┘  │
  ┌──────────┐          │                                                         │
  │          │          │  ┌──────────────────┐    ┌──────────────────────────┐  │
  │  Admin   │──────────┼─►│  Member Settings  │    │    Notifications         │  │
  │          │          │  │  ● Invite Member  │    │  ● View Notifications    │  │
  └──────────┘          │  │  ● Remove Member  │    │  ● Mark as Read          │  │
       │                │  │  ● Change Role    │    │  ● Receive Mention       │  │
       │                │  └──────────────────┘    │  ● Receive Card Assign   │  │
  ┌──────────┐          │                          └──────────────────────────┘  │
  │          │          │  ┌──────────────────┐    ┌──────────────────────────┐  │
  │  Owner   │──────────┼─►│   All Admin +    │    │    Real-Time Presence    │  │
  │          │          │  │   Editor actions │    │  ● See Active Users      │  │
  └──────────┘          │  │  ● Delete Project│    │  ● Show Cursors/Avatars  │  │
                        │  └──────────────────┘    └──────────────────────────┘  │
                        │                                                         │
                        └─────────────────────────────────────────────────────────┘

Role Hierarchy:
  Guest ──► Viewer ──► Editor ──► Admin ──► Owner
  (unauthenticated)               (can manage     (full
                                   members)       control)

Legend:
  ──►  Actor can perform use case
  ●    Use case / action
```

### Use Case Descriptions Summary

| Actor   | Capabilities                                                                                   |
|---------|-----------------------------------------------------------------------------------------------|
| Guest   | Sign Up, Login (email/password or Google OAuth)                                               |
| Viewer  | View pages, view board & cards, receive notifications                                          |
| Editor  | All Viewer + create/edit/delete pages & cards, drag cards, restore page versions, mention users|
| Admin   | All Editor + invite/remove members, change member roles                                        |
| Owner   | All Admin + delete the project itself                                                          |
```
