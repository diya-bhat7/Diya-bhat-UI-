# Airtable Integration - Schema Document

## Overview

This document defines the Airtable table structure that mirrors your Supabase database for 2-way synchronization.

---

## Airtable Base Structure

You need **1 Airtable Base** with **3 Tables** matching your Supabase schema:

### Table 1: Companies

| Field Name | Field Type | Notes |
|------------|------------|-------|
| `supabase_id` | Single line text | UUID from Supabase (Primary sync key) |
| `company_name` | Single line text | Required |
| `company_website` | URL | Optional |
| `company_linkedin` | URL | Optional |
| `office_locations` | Multiple select | Array of locations |
| `contact_email` | Email | Required |
| `contact_name` | Single line text | Required |
| `contact_title` | Single line text | Optional |
| `last_synced_at` | Date (include time) | Auto-set on sync |

---

### Table 2: Positions

| Field Name | Field Type | Notes |
|------------|------------|-------|
| `supabase_id` | Single line text | UUID from Supabase (Primary sync key) |
| `Company` | Link to Companies | Link to Companies table |
| `position_name` | Single line text | Required |
| `category` | Single select | Engineering, Sales, Marketing, etc. |
| `status` | Single select | draft, active, paused, closed |
| `priority` | Single select | Low, Medium, High, Urgent |
| `work_type` | Single select | Remote, Hybrid, In-Office |
| `num_roles` | Number | Default: 1 |
| `min_experience` | Number | Years |
| `max_experience` | Number | Years |
| `preferred_locations` | Multiple select | Array |
| `hiring_start_date` | Date | Optional |
| `key_requirements` | Long text | Optional |
| `last_synced_at` | Date (include time) | Auto-set on sync |

---

### Table 3: Candidates

| Field Name | Field Type | Notes |
|------------|------------|-------|
| `supabase_id` | Single line text | UUID from Supabase (Primary sync key) |
| `Position` | Link to Positions | Link to Positions table |
| `name` | Single line text | Required |
| `email` | Email | Required |
| `phone` | Phone number | Optional |
| `status` | Single select | new, screening, interview, offer, hired, rejected |
| `rating` | Rating (1-5) | Optional |
| `linkedin_url` | URL | Optional |
| `resume_url` | URL | Optional |
| `notes` | Long text | Optional |
| `last_synced_at` | Date (include time) | Auto-set on sync |

---

## Sync Tracking Fields

Every table includes these system fields for conflict resolution:

| Field | Purpose |
|-------|---------|
| `supabase_id` | UUID linking to Supabase record |
| `last_synced_at` | Timestamp of last successful sync |

---

## Sync Rules

### Direction: Supabase → Airtable
- New records: Create in Airtable with `supabase_id`
- Updated records: Update if Supabase `updated_at` > Airtable `last_synced_at`
- Deleted records: Mark as deleted (soft delete) or remove

### Direction: Airtable → Supabase
- New records (no `supabase_id`): Create in Supabase, update Airtable with new UUID
- Updated records: Update if Airtable modified time > Supabase `updated_at`
- Deleted records: Delete from Supabase

### Conflict Resolution
- **Last Write Wins**: Most recent `updated_at` takes precedence
- Conflicts logged to a separate `sync_conflicts` table for review

---

## Visual Diagram

```
┌─────────────────┐         ┌─────────────────┐
│    SUPABASE     │◄───────►│    AIRTABLE     │
│                 │  2-Way  │                 │
│  companies      │  Sync   │  Companies      │
│  positions      │         │  Positions      │
│  candidates     │         │  Candidates     │
└─────────────────┘         └─────────────────┘
         │                           │
         ▼                           ▼
    ┌─────────────────────────────────┐
    │       Straatix Dashboard        │
    │      (Real-time Updates)        │
    └─────────────────────────────────┘
```
