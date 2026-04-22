# Test Cases — replaceit.ai
**Project:** Replace IT Website  
**URL:** https://replaceit.ai  
**Date:** March 31, 2026  
**Total Test Cases:** 46

---

## Overview

This document describes the automated test cases covering the Replace IT website. The goal of these tests is to ensure that all pages load correctly, key content is visible to visitors, navigation works as expected, and the contact form behaves properly.

Tests are organized by section of the website.

---

## 1. Navigation

These tests verify that visitors can move between pages reliably using the site's navigation menu and logo.

| # | Test Case | What it checks |
|---|-----------|----------------|
| 1.1 | Home link in nav | Clicking "Home" in the navigation menu takes the user to the homepage |
| 1.2 | Services link in nav | Clicking "Services" in the navigation menu takes the user to the Services page |
| 1.3 | About Us link in nav | Clicking "About Us" in the navigation menu takes the user to the About Us page |
| 1.4 | Contact link in nav | Clicking "Contact" in the navigation menu takes the user to the Contact page |
| 1.5 | Logo navigates home | Clicking the company logo from any page returns the user to the homepage |
| 1.6 | Homepage loads | The homepage opens successfully and displays its main heading |
| 1.7 | Services page loads | The Services page opens successfully and displays its main heading |
| 1.8 | About Us page loads | The About Us page opens successfully and displays its main heading |
| 1.9 | Contact page loads | The Contact page opens successfully and displays its main heading |

---

## 2. Home Page

These tests verify that the homepage displays all key sections and that its primary call-to-action works.

| # | Test Case | What it checks |
|---|-----------|----------------|
| 2.1 | Hero heading visible | The main headline "Algorithms to impact your business" is displayed prominently |
| 2.2 | Clients section visible | The "Clients" section is present on the page |
| 2.3 | Our Results section visible | The "Our Results" section is present and visible |
| 2.4 | Engagement Models section visible | The "Engagement Models" section is present and visible |
| 2.5 | "View services" button works | Clicking the "View services" button takes the user to the Services page |

---

## 3. Services Page

These tests verify that all service offerings are displayed correctly and that each one links through to the Contact page.

| # | Test Case | What it checks |
|---|-----------|----------------|
| 3.1 | Hero heading visible | The main headline "We create digital products" is displayed |
| 3.2 | All service cards present | All 8 services are listed: Chatbots with RAG, Autonomous AI Agents, Computer Vision, Process Automation, Generative AI, NLP & Sentiment Analysis, Recommendation Systems, and Document Processing |
| 3.3 | Correct number of "Apply now" buttons | There is one "Apply now" button for each of the 8 services |
| 3.4–3.11 | Each "Apply now" button works | Clicking the "Apply now" button on each service card takes the user to the Contact page (one test per service) |

---

## 4. About Us Page

These tests verify that the About Us page loads with its core content.

| # | Test Case | What it checks |
|---|-----------|----------------|
| 4.1 | Hero heading visible | The main headline "About us" is displayed |
| 4.2 | Gallery section visible | The "Gallery" section is present on the page |

---

## 5. Contact Page

These tests verify that the contact form is present, behaves correctly when filled in, and that the contact details are visible.

| # | Test Case | What it checks |
|---|-----------|----------------|
| 5.1 | Hero heading visible | The main headline "Get in touch with us" is displayed |
| 5.2 | Form fields present | The form contains the three expected fields: Full Name, Email, and Reason for contact |
| 5.3 | Send button present | The "Send" button is visible on the page |
| 5.4 | Contact email visible | The company email address is displayed on the page |
| 5.5 | Phone number visible | The company phone number is displayed on the page |
| 5.6 | Empty form submission blocked | Submitting the form without filling in any fields does not process the request — the user stays on the Contact page |
| 5.7 | Invalid email blocked | Submitting the form with an incorrectly formatted email address (e.g. missing "@") is rejected — the user stays on the Contact page |
| 5.8 | Valid form submission accepted | Filling in all fields correctly and clicking "Send" shows a success banner: \"Thank you! Your details have been sent successfully\" |

---

## 6. Footer & Compliance

These tests verify that footer links (legal/policy + social) are present and behave correctly.

| # | Test Case | What it checks |
|---|-----------|----------------|
| 6.1 | Privacy policy link works | Clicking the Privacy link navigates to the `#priv` section (or equivalent) |
| 6.2 | Cookie policy link works | Clicking the Cookies link navigates to the `#cookies` section (or equivalent) |
| 6.3 | Terms & Conditions link works | Clicking the Terms link navigates to the `#term` section (or equivalent) |
| 6.4 | Instagram link present | Footer includes an Instagram link with the expected URL |
| 6.5 | Facebook link present | Footer includes a Facebook link with the expected URL |
| 6.6 | LinkedIn link present | Footer includes a LinkedIn link with the expected URL |

---

## 7. Cross-cutting (Quality Gates)

These tests apply across multiple pages to catch broken deployments that still “look OK” visually.

| # | Test Case | What it checks |
|---|-----------|----------------|
| 7.1 | No severe console errors (Home) | Loading the homepage does not produce browser console errors or page exceptions |
| 7.2 | No severe console errors (Services) | Loading the Services page does not produce browser console errors or page exceptions |
| 7.3 | No severe console errors (About Us) | Loading the About Us page does not produce browser console errors or page exceptions |
| 7.4 | No severe console errors (Contact) | Loading the Contact page does not produce browser console errors or page exceptions |
| 7.5 | Unknown route behavior | Visiting a non-existent route shows a 404 state or redirects in an expected way |

---

## Notes

- **Test 5.8 (valid form submission)** should assert the success banner text: \"Thank you! Your details have been sent successfully\".
- All tests run in a real browser (Chromium) to accurately reflect the experience of an actual visitor.
- A full test run generates an HTML report automatically, available for review after each execution.
