# Monitoring & Logging Report

## PM2 Monitoring

The hospital management system uses PM2 process management for:

- uptime monitoring
- automatic restarts
- memory monitoring
- CPU monitoring
- production stability

---

## Logging

Application logs are monitored using:

```bash
pm2 logs
```

This provides visibility into:

- server startup
- database connectivity
- runtime errors
- deployment activity

---

## Error Handling

Global error handlers were implemented to capture:

- uncaught exceptions
- unhandled promise rejections

This improves system reliability and fault tolerance.

---

## Uptime Monitoring

PM2 provides real-time uptime visibility including:

- online/offline state
- restart counts
- uptime duration

This ensures production stability for healthcare operations.