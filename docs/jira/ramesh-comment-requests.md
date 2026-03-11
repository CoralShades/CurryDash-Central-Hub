# Jira Issues Assigned to Ramesh Sanjaya — Comments Mentioning "Details"

**Source:** JQL search across CAD and CUR projects, filtered for comments containing "details"
**Generated:** 2026-03-06
**Total issues returned:** 11 (all from CAD project)

---

## Summary Table

| # | Key | Summary | Status | Updated | Comments w/ "details" | Clarification Requests |
|---|-----|---------|--------|---------|----------------------|----------------------|
| 1 | CAD-66 | Admin Package Detail & Modification | DEVTESTED | 2026-03-04 | 3 | Yes |
| 2 | CAD-178 | Package Image Not Displayed After Order Placement | DEVTESTED | 2026-03-04 | 3 | No |
| 3 | CAD-67 | Package Deletion & Secondary Management TBD | DEVTESTED | 2026-03-04 | 1 | No |
| 4 | CAD-81 | Package view functionality not working on admin portal | DEVTESTED | 2026-03-04 | 1 | No |
| 5 | CAD-142 | Introduce ABN field for restaurants | SIT | 2026-03-04 | 2 | Yes |
| 6 | CAD-143 | Admin Notification: Modified ABN Number | READY FOR UAT | 2026-03-03 | 3 | Yes |
| 7 | CAD-180 | Implement "Draft" Status and "Save as Draft" Workflow for Packages | DEVTESTED | 2026-03-03 | 1 | Yes |
| 8 | CAD-99 | Story 4.4: Vendor Account Suspension | SIT | 2026-02-27 | 3 | Yes |
| 9 | CAD-192 | Story 2.A2: Admin Package Review & Approval | In Progress | 2026-02-25 | 1 | No |
| 10 | CAD-176 | Vendor Portal Access Not Restricted After Account Suspension | READY FOR UAT | 2026-02-23 | 1 | No |
| 11 | CAD-184 | Packages: create/edit flow improvements | READY FOR UAT | 2026-02-23 | 3 | Yes |

---

## Detailed Comment Excerpts

### CAD-66 — Admin Package Detail & Modification

**Comment 1 — Kasun Mendis (2025-12-30) — TEST FAIL**
> Image, Name, restaurant, price details visible in list view. Edit package: Package groups stage should display food item labels instead of 'Food #Id'. Admin portal throws the following error when attempting to update a package record: "The PUT method is not supported for route admin/package/update/4. Supported methods: POST."

**Comment 6 — Minuri Rubasinghe (2026-03-04) — TEST FAIL** [CLARIFICATION REQUEST]
> Package Section Visibility Restricted to Super Admin Only. Currently, only Super Admin users have access and visibility to the Package section. Admin users are unable to view or access this module. As per the Admin Package Detail & Modification requirements, Admin users must have access to: View vendor-created packages, Modify package configurations (selection rules, pricing overrides, scheduling, etc.), Audit vendor settings. This functionality is currently not available to the Admin role and requires permission updates to align with the specification.
>
> Audit Trail Not Implemented: As per the acceptance criteria, every time an Admin modifies and saves a package, a record must be added to an internal audit log capturing: Admin User ID, Timestamp, Fields changed. Currently no audit log entry is generated when a Super Admin modifies and saves a package. Field-level change tracking is not recorded.

**Comment 7 — Minuri Rubasinghe (2026-03-04)** [CLARIFICATION REQUEST]
> @Ramesh Sanjaya Bug ticket has been created for this issue. Please refer to [linked ticket] for details.

---

### CAD-178 — Package Image Not Displayed After Order Placement

**Comment 3 — Kasun Mendis (2026-02-10) — TEST PASS**
> Packages photo/food item photo visible in order details page. New orders #100069, Old orders #100014.

**Comment 4 — Vimukthi Ravindu (2026-02-17) — TEST PASS**
> Package image issue is resolved and order details display as expected.

**Comment 5 — Minuri Rubasinghe (2026-02-23) — TEST PASS**
> Tested by placing an order with a package containing an uploaded package image. Package image is now correctly displayed in the order details section. Individual item images within the package continue to display as expected. No missing image or UI alignment issues observed.

---

### CAD-67 — Package Deletion & Secondary Management TBD

**Comment 5 — Vimukthi Ravindu (2026-02-18) — TEST PASS**
> Delete option available in the Package Detail page. Package record successfully removed after deletion. Success message displayed.

---

### CAD-81 — Package view functionality not working on admin portal

**Comment 3 — Vimukthi Ravindu (2026-02-18) — TEST PASS**
> Admin able to view package details: Package name, description, price, status, groups, limits, items, additional prices.

---

### CAD-142 — Introduce ABN field for restaurants

**Comment 1 — Ramesh Sanjaya (2026-01-21) — TEST PASS**
> Restaurant can change/put ABN number, r-certification to details. Test pass.

**Comment 4 — Minuri Rubasinghe (2026-03-04)** [CLARIFICATION REQUEST]
> Detailed validation rules specification provided:
> - ABN: Must be exactly 11 digits, numbers only, first digit cannot be 0. Editable by Super Admin only, visible read-only for Admin.
> - TFN: Must be exactly 9 digits, numbers only.
> - Mandatory rule: "Please provide either ABN or TFN to register your business."
>
> Issues flagged: Currently admin is able to update both ABN and TFN fields (should be Super Admin only). Both ABN and TFN fields are displayed as optional in both Admin Portal Edit and Vendor Portal registration form (should enforce mandatory rule).

---

### CAD-143 — Admin Notification: Modified ABN Number

**Comment 2 — Kasun Mendis (2026-01-23)** [CLARIFICATION REQUEST]
> Notification should be received by admins if a vendor modifies their ABN Number. Notification action button/link should take admin user to restaurant details page. Warning message visible on restaurant detail pages where ABN was recently updated. Accept action should hide the warning message and warning icon in restaurant list view. Reject action should move restaurant into 'Suspended' status.
>
> **@Ramesh Sanjaya Could we include the Updated ABN/TFN in the warning message? If possible, display the old ABN/TFN as well.**

**Comment 5 — Vimukthi Ravindu (2026-02-17) — TEST PASS**
> Admins receive a notification when a vendor updates their ABN number. Warning message is visible on the restaurant detail page after ABN update. Clicking Accept hides the warning message and warning icon in the restaurant list view. Clicking Reject moves the restaurant to Suspended status. Warning icon appears correctly in the restaurant list view for recently updated ABNs.

**Comment 6 — Minuri Rubasinghe (2026-03-03) — TEST PASS**
> Admin Notification Trigger verified. Header displayed as: "Compliance Alert: Vendor ABN Change". Body: "[Vendor Name] has updated their business registration details. Review required before next payout." "View Details" action button navigates correctly to the respective Restaurant Details page. Warning icon appears between Restaurant ID and Restaurant Photo columns. Approve Action removes warning. Reject Action updates vendor status to Suspended. Suspension logged correctly.

---

### CAD-180 — Implement "Draft" Status and "Save as Draft" Workflow for Packages

**Comment 2 — Kasun Mendis (2026-02-05) — PARTIAL TEST PASS** [CLARIFICATION REQUEST]
> 'Draft' action is not available for existing package records. 'Save as Draft' action available when creating new package records. Package details are being saved as expected. Error: "The configurations.O.group_title field is required" is displayed in 'Package Groups' stage if a group title is empty when saving a package.
>
> **Message should either be meaningful or Save as draft action should be allowed even though 'Group title' fields are empty.**

---

### CAD-99 — Story 4.4: Vendor Account Suspension

**Comment 5 — Kasun Mendis (2026-01-14)** [CLARIFICATION REQUEST]
> Bulk activation prevents admin users from updating 'Reason for Suspension' details. Suspended restaurants are visible on web app. Users are able to add items to the cart.

**Comment 10 — Kasun Mendis (2026-02-03) — TEST PASS**
> Moderation section accessible for admin users. Restaurant list columns verified. Activity tab captures moderation related events. 'Account suspended' message visible in admin portal restaurant details page. Restaurant page 'Manually reactivate' action works as expected. Vendors can not navigate past dashboard page on suspended accounts.

**Comment 11 — Minuri Rubasinghe (2026-02-27) — TEST FAIL** [CLARIFICATION REQUEST]
> Status filters are not functioning correctly. When selecting Active Status, the list does not consistently show only active restaurants. The filtering logic needs to be fixed so that each status filter returns only the corresponding restaurant records. @Ramesh Sanjaya FYI
>
> Vendor unable to receive notification/email on reactivation. @Ramesh Sanjaya FYI
>
> Activity Log Entry on Suspension should contain: Restaurant name, Action type, Admin ID, Timestamp, Reason. @Ramesh Sanjaya FYI
>
> **Critical issue: If a restaurant is suspended after a user has already added items to cart, the system still allows the order to be placed. Users on Checkout or Payment pages can still complete orders without restriction. Expected behavior: Once suspended, users should not be able to place orders at any stage.** @Ramesh Sanjaya FYI

---

### CAD-192 — Story 2.A2: Admin Package Review & Approval

**Comment 1 — Vimukthi Ravindu (2026-02-25)**
> Package Management shows all packages with: Vendor name, Package name, Price, Configuration count, Status, Creation date. Clicking a package shows full details: Configuration groups, Options with pricing, Images, Description. Clicking "Request Changes" on a non-compliant package lets admin specify changes. Updated packages from vendors appear in the "Review Queue" for re-review. Package analytics display order count, revenue, and customer ratings per package.

---

### CAD-176 — Vendor Portal Access Not Restricted After Account Suspension

**Comment 3 — Vimukthi Ravindu (2026-02-17) — TEST PASS**
> Suspended vendor account displays "Restaurant Account Suspended" message with correct details. Orders, menu management, and operational features are disabled during suspension. Vendor cannot perform restricted actions while suspended. Vendor access and operations are restored correctly after reactivation.

---

### CAD-184 — Packages: create/edit flow improvements

**Comment 2 — Kasun Mendis (2026-02-05) — PARTIAL TEST FAIL** [CLARIFICATION REQUEST]
> Package Details Stage: Name, Base Price and Package image fields should be mandatory in order to access the next stage. Base price field should not accept negative values. Package flow specifies that package image proportions should be 1:1.
>
> **Package Groups stage does not validate negative values. Allows users to access the next stage. Flow throws [object object] error at the end.**
>
> All group titles should be populated to access the next stage. Min choices < Max choices. At least one food item assigned to each group.

**Comment 5 — Vimukthi Ravindu (2026-02-17) — TEST PASS**
> Users cannot proceed to the next stage without completing mandatory fields in Package Details (Name, Package Image). Base price does not accept negative values. Image validation enforces 1:1 ratio. At least one group is required. Min/Max choices and additional charge fields do not accept negative values. All group titles must be populated. At least one food item assigned to each group. Inline validation messages are displayed.

**Comment 6 — Minuri Rubasinghe (2026-02-23) — TEST PASS**
> All validations verified: mandatory fields block progression, negative value validation on Base Price / Min/Max choices / Additional Charge fields, 1:1 image ratio enforcement, group title required, food item assignment required per group.

---

## Flagged Clarification Requests

The following comments represent explicit requests for clarification, feature questions, or issues raised by testers/developers that require Ramesh Sanjaya's attention:

| Issue | Commenter | Date | Nature of Request |
|-------|-----------|------|-------------------|
| CAD-66 | Minuri Rubasinghe | 2026-03-04 | Package section restricted to Super Admin only; Admin role missing access; Audit Trail not implemented. Requests permission updates and audit log implementation. |
| CAD-66 | Minuri Rubasinghe | 2026-03-04 | Directs Ramesh to a bug ticket created for the access/audit issue. |
| CAD-142 | Minuri Rubasinghe | 2026-03-04 | Detailed ABN/TFN validation spec provided. Flags that Admin can currently edit ABN/TFN (should be Super Admin only) and mandatory rule not enforced. |
| CAD-143 | Kasun Mendis | 2026-01-23 | Asks Ramesh if the updated ABN/TFN can be included in the warning message, and if possible, the old value as well. |
| CAD-180 | Kasun Mendis | 2026-02-05 | Requests clarification: should "Save as Draft" be allowed without group titles, or should the error message be more meaningful? |
| CAD-184 | Kasun Mendis | 2026-02-05 | Reports negative value validation missing on Package Groups stage and [object object] error thrown at end of flow. |
| CAD-99 | Kasun Mendis | 2026-01-14 | Reports bulk activation prevents updating 'Reason for Suspension' details; suspended restaurants still visible on web app. |
| CAD-99 | Minuri Rubasinghe | 2026-02-27 | Multiple items flagged for Ramesh (tagged @Ramesh Sanjaya FYI): broken status filters, missing reactivation notifications, incomplete activity logs, and critical issue where suspended restaurant orders can still be placed mid-checkout. |
