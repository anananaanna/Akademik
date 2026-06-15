# NgRx Store

This directory will contain the NgRx state management setup.

## Planned Structure

```
store/
├── app.state.ts          # Root state interface
├── app.effects.ts        # Root effects
├── auth/
│   ├── auth.actions.ts
│   ├── auth.effects.ts
│   ├── auth.reducer.ts
│   └── auth.selectors.ts
├── users/
└── bookings/
```

## Setup (future step)
```bash
npm install @ngrx/store @ngrx/effects @ngrx/entity @ngrx/router-store @ngrx/store-devtools
```
