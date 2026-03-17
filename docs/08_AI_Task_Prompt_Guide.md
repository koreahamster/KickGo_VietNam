# AI Task Instruction Guide

When asking another AI to perform work, always attach these documents:

Required order:

1.  FootGo_Tech_Spec_v1_1.md (overall system architecture)

2.  FootGo_Database_ERD_v1_1.md (database schema reference)

3.  FootGo_API_Spec_v1_1.md (backend API structure)

4.  FootGo_RLS_Policies_v1_1.md (security rules)

5.  FootGo_Coding_Rules_v1_1.md (coding standards)

6.  FootGo_Feature_Task_Order_v1_1.md (development sequence)

Then give the AI a task such as:

Example prompt:

"Implement team creation API based on: Tech Spec + ERD + API Spec.
Follow Coding Rules. Do not modify schema."

Never ask an AI:

"Build the whole app."

Always assign tasks per feature.
