# Vue Project with Deno

This project uses Vue.js with Deno as the runtime environment.

## Prerequisites

- [Deno](https://deno.com/) installed on your system

## Running the Project

### Development
```bash
deno task dev
```

### Build for Production
```bash
deno task build
```

### Preview Production Build
```bash
deno task preview
```

## Notes

- This project uses Vite as the build tool, running natively with Deno
- All Vue functionality remains intact
- The project is fully migrated to Deno with no Node.js dependencies
- Uses Deno's JSR imports for dependencies