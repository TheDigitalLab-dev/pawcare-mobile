<!--
STATUS: ✅ IMPLEMENTADO
Completado: 2024
Componentes: Hero, Navbar, Footer, Services, Contact en app/frontend/components/landing/
Páginas: Home, About, Services, Contact, Privacy, Terms en app/frontend/pages/
-->

# US-002: Landing Page & Static Pages

## Overview

Implementation of public pages including the main landing page and static support pages. Based on `frontendMockup/landing-peludog/` mockup.

**Note:** Authentication pages (Login, Register) are **out of scope** - they will be handled by a dedicated auth controller in a separate user story.

---

## Epic 1: Public Pages (Static Pages)

### US-1.1: Home Page (Landing)
**As a** site visitor
**I want to** see an attractive and informative home page
**So that** I can learn about PawCare services and decide to schedule an appointment

**Acceptance Criteria:**
- [ ] Navbar with logo, navigation, and CTA buttons
- [ ] Hero section with main CTA
- [ ] Announcements/promotions section
- [ ] About section with statistics
- [ ] Services section with cards
- [ ] Secondary CTA section
- [ ] Contact section with information
- [ ] Footer with links and social media

**Route:** `GET /`
**Controller:** `PagesController#home`
**View:** `pages/Home.tsx`

---

### US-1.2: Services Page
**As a** site visitor
**I want to** see detailed information about offered services
**So that** I can understand what services are available

**Acceptance Criteria:**
- [ ] Detailed list of services
- [ ] Description of each service
- [ ] Pricing (if applicable)
- [ ] CTA to schedule appointment

**Route:** `GET /services`
**Controller:** `PagesController#services`
**View:** `pages/Services.tsx`

---

### US-1.3: About Page
**As a** site visitor
**I want to** learn more about the company
**So that** I can build trust before using the services

**Acceptance Criteria:**
- [ ] Company history
- [ ] Mission and vision
- [ ] Team (staff)
- [ ] Relevant statistics

**Route:** `GET /about`
**Controller:** `PagesController#about`
**View:** `pages/About.tsx`

---

### US-1.4: Contact Page
**As a** site visitor
**I want to** see contact information
**So that** I can communicate with the clinic

**Acceptance Criteria:**
- [ ] Contact form
- [ ] Location information
- [ ] Business hours
- [ ] Phone numbers and email
- [ ] Map placeholder

**Route:** `GET /contact`
**Controller:** `PagesController#contact`
**View:** `pages/Contact.tsx`

---

## Epic 2: Legal & Utility Pages

### US-2.1: Terms and Conditions Page
**As a** visitor
**I want to** read the terms of use
**So that** I can understand the service conditions

**Route:** `GET /terms`
**Controller:** `PagesController#terms`
**View:** `pages/Terms.tsx`

---

### US-2.2: Privacy Policy Page
**As a** visitor
**I want to** read the privacy policy
**So that** I can understand how my data is handled

**Route:** `GET /privacy`
**Controller:** `PagesController#privacy`
**View:** `pages/Privacy.tsx`

---

### US-2.3: 404 Page (Not Found)
**As a** visitor
**I want to** see a friendly error page when a route doesn't exist
**So that** I can navigate back to the site

**Acceptance Criteria:**
- [ ] Clear error message
- [ ] Link to home page
- [ ] Consistent design with the site

**View:** `pages/NotFound.tsx`

---

## Routes Summary

| Route | Controller#Action | Inertia View |
|-------|-------------------|--------------|
| `GET /` | `pages#home` | `pages/Home` |
| `GET /services` | `pages#services` | `pages/Services` |
| `GET /about` | `pages#about` | `pages/About` |
| `GET /contact` | `pages#contact` | `pages/Contact` |
| `GET /terms` | `pages#terms` | `pages/Terms` |
| `GET /privacy` | `pages#privacy` | `pages/Privacy` |

---

## Out of Scope

The following pages are **NOT** part of this user story:
- Login page (`/login`) - handled by Auth controller
- Register page (`/register`) - handled by Auth controller
- Password recovery - handled by Auth controller
- Appointments page (`/appointments/new`) - handled by Appointments controller

---

## Landing Page Components (Sections)

Based on the mockup, the Home page includes:

1. **Navbar** - Main navigation with logo and links
2. **Hero** - Main section with CTA
3. **Announcements** - Promotions and announcements (3 cards)
4. **About** - Company information with stats
5. **Services** - Offered services (4 cards)
6. **CTA** - Secondary call to action
7. **Contact** - Contact information
8. **Footer** - Page footer with links

---

## Dependencies

- Completed: `001-design-system.md` (UI components)
- Required: Layouts (PublicLayout)

---

## Implementation Phases

### Phase 1: Backend (TDD)
1. Write request specs for each endpoint
2. Implement routes in `config/routes.rb`
3. Implement actions in `PagesController`
4. Verify all tests pass

### Phase 2: Frontend - Structure
1. Create basic Inertia pages
2. Integrate with layouts
3. Configure Inertia routes

### Phase 3: Frontend - Content
1. Implement Home page sections
2. Implement secondary pages
3. Responsive design
4. Final adjustments

---

## Technical Notes

- **Inertia.js**: React page rendering from Rails
- **Layout**: Use `PublicLayout` for public pages
- **SEO**: Consider meta tags for each page
- **i18n**: Content in Spanish (es-VE/es-MX), code in English
