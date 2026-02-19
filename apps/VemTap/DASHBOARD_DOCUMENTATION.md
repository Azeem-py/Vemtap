# VemTap Dashboard Documentation

## 1. Introduction
VemTap is an Offline Visitor Data Capture Platform designed to help physical businesses automatically collect customer details, engage visitors, and build loyalty without complex app downloads. The dashboard serves as the central command center for managing customer data, marketing campaigns, loyalty programs, and physical hardware (NFC tags/devices).

---

## 2. Dashboard Overview
The **Dashboard Overview** is the landing page for business owners and managers. It provides a snapshot of the business's performance and quick access to essential actions.

### Key Metrics
- **Total Visitors**: The cumulative number of unique visitors recorded.
- **New Visitors**: Count of first-time visitors, indicating growth.
- **Repeat Visitors**: Count of returning customers, indicating retention.
- **Today's Visits**: Real-time count of check-ins for the current day.

### Features
- **Visitor Activity Chart**: Visualizes hourly footfall traffic to identify peak hours.
- **Quick Actions**:
  - **Simulate Check-in**: Useful for testing the system flow.
  - **Manual Entry**: Add a visitor who didn't use the NFC tap.
  - **New Message**: Quickly compose a message to customers.
  - **Add Device**: Link a new NFC hardware device.
  - **Export Data**: Download visitor logs for external analysis.
- **Recent Visitors**: A list of the latest check-ins with details like name, phone, status (New/Returning), and time.
  - **Actions**: Send a welcome message or issue a reward directly from the list.

---

## 3. Analytics
The **Analytics** page offers deep insights into customer behavior and campaign performance.

### Performance Metrics
- **Total Visits & Trends**: Detailed breakdown of visit counts over time (7D, 30D, 90D).
- **Avg. Stay Time**: Estimate of how long customers stay (if applicable/tracked).
- **Repeat Rate**: Percentage of customers who return.

### Messaging ROI
Tracks the effectiveness of communication campaigns:
- **Sent/Delivered/Opened**: Funnel metrics for message delivery.
- **Clicked**: Engagement rate with links in messages.

### Traffic & Engagement
- **Peak Traffic Times**: Heatmap or bar chart showing the busiest hours of the day.
- **Engagement Quality**: Metrics on survey completion, review conversion, and social media follows.
- **Top Performers**: Identifies the most successful touchpoints (e.g., specific NFC tags, survey types).

---

## 4. Visitor Management
The **Visitors** section is the database of all customer interactions.

### Features
- **Visitor List**: Comprehensive table of all visitors with search and filter capabilities.
- **Filtering**:
  - **Search**: Find visitors by name or phone number.
  - **Status Filter**: View only New, Returning, or VIP visitors.
- **Visitor Profile**: Detailed view of a specific visitor's history, contact info, and engagement level.
- **Actions**:
  - **Quick Message**: Send an individual SMS/WhatsApp/Email.
  - **Issue Reward**: Manually grant a loyalty reward or coupon.
  - **Export CSV**: Download the visitor list for external use (e.g., marketing tools).

---

## 5. Messaging System
VemTap's **Messaging** module allows businesses to communicate directly with their customers via SMS, WhatsApp, and Email.

### Features
- **Campaigns**: Create and schedule bulk messages to target groups (e.g., "New Visitors from last week").
- **Templates**: Save reusable message content for quick sending.
- **Automation**: (See Automations section) Set up triggers for automatic messages.
- **History**: View logs of past messages and their delivery status.

---

## 6. Loyalty Program
The **Loyalty** module helps businesses retain customers through rewards and tiers.

### Features
- **Rewards Management**: Create and edit rewards (e.g., "Free Coffee after 5 visits").
- **Points System**: Configure how points are earned (e.g., per visit or per spend).
- **Customer Directory**: View loyalty status of customers.
- **Verification**: Tools for staff to verify and redeem customer rewards in-store.

---

## 7. NFC & Device Management
This section handles the physical infrastructure of the VemTap system.

### NFC Manager
- **Asset Generation**: Create unique links for NFC tags.
- **Batch Creation**: Generate multiple links at once for large deployments.
- **QR Codes**: Download print-ready QR codes corresponding to each NFC link.
- **Management**: Edit destination URLs or delete assets.

### Devices
- **Device List**: View all registered hardware devices (e.g., table stands, wall mounts).
- **Status Monitoring**: Check if devices are Online or Offline.
- **Configuration**: Edit device names, locations, and behaviors.
- **Stats**: View scan counts per device to measure performance of specific locations.

---

## 8. Automations
**Automations** allow businesses to set up "set and forget" engagement rules.

### Rule Engine
- **Triggers**: Events that start an automation (e.g., "First-time Tag", "Repeat Tag", "Reward Earned").
- **Conditions**: Delays or criteria (e.g., "Wait 2 hours", "Wait 24 hours").
- **Actions**: What happens when the trigger and condition are met (e.g., "Send SMS", "Push Review Link").

### Examples
- **Review Booster**: Send a Google Review link 2 hours after a customer's first visit.
- **Feedback Survey**: Send a satisfaction survey 24 hours after a visit.
- **Loyalty Promo**: Send a discount code if a customer hasn't returned in 7 days.

---

## 9. Staff Management
Control who has access to the dashboard and what they can do.

### Roles & Permissions
- **Owner**: Full administrative access, including billing and sensitive settings.
- **Manager**: Access to dashboard, visitors, messaging, and analytics. Can issue rewards.
- **Staff**: Limited access, typically for visitor check-ins and basic verification.

### Actions
- **Invite Staff**: Add new team members via email.
- **Edit Roles**: Change a user's permission level.
- **Remove Access**: Revoke dashboard access for former employees.

---

## 10. Settings
The configuration hub for the business account.

### Categories
- **Business Profile**: Edit business name, logo, and contact details.
- **Notifications**: Configure email/SMS alerts for the business owner (e.g., "Notify me of new feedback").
- **Device Settings**: Global defaults for NFC devices.
- **Integrations**: Connect with third-party tools (POS, CRM, Email Marketing).
- **Message Settings**: Customize default messages (Welcome, Thank You).
- **Engagement**: Configure post-tap experiences (what the customer sees on their phone).
- **Data & Privacy**: Manage data retention policies and compliance (GDPR/CCPA).

---

## 11. Support
Access to help and technical assistance.

### Features
- **Ticket System**: Submit and track support requests for hardware or software issues.
- **Emergency Protocol**: Hotline or priority contact for critical failures.
- **Documentation**: Links to guides, FAQs, and tutorials for using the platform.
