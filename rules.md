TiDB AgentX Hackathon 2025
Forge Agentic AI for Real-World Impact
Welcome to the TiDB AgentX Hackathon: Forge Agentic AI for Real-World Impact, running from August 1 to September 15, 2025. Last year’s event saw thousands of developers build simple RAG demos. This year, we want multi-step AI agents that demonstrate real-world workflows. Whether you use vector search, full-text search, Model Context Protocol (MCP), or LLMs, your goal is to deliver solutions that do more than answer a single question. Teams can win a share of over $30,000 in prizes, connect with TiDB engineers, and be featured on our blog and podcast. Let’s see what you can build.Requirements
What to Build
Leverage TiDB Serverless (including vector search) on TiDB Cloud to create a working software application that showcases an innovative, multi-step, agentic solution. Your agent must chain together at least two of the following building blocks in a single automated workflow:

Sample Project Workflows (for inspiration only)
Step
Description
Ingest & Index Data
Pull in vectors, full-text docs, images or logs into TiDB Serverless (PDFs, chat logs, sensor feeds, whatever you like)
Search Your Data
Query those indexes with vector search, full-text search or both to find similar cases and relevant records
Chain LLM Calls (Optional)
Call any LLM to analyze results, summarize findings or suggest next steps
Invoke External Tools
Plug in APIs or services such as payment gateways, mapping services, calculators or Slack bots
Build a Multi-Step Flow
Wire everything together so the agent moves from input all the way through to a final action in a single automated process

Sample applications built with TiDB Serverless.
What to Submit
Provide the TiDB Cloud account Email associated with the Project (You can sign up for a TiDB Cloud account here)
Include a URL to the Project code repository. Access to the Project code repository must be provided by making it public or by giving access to hackathon-judge@pingcap.com
Note: To be eligible for the Best Open Source Award, repository must be public and an OSI approved license must be included. Open source license is not required to be eligible for any other Prize.
Include a simple summary outlining your data flow and integrations.
 
Include a short “Run Instructions” text file (or README) so judges can easily launch or view your demo.
Include a text description that should explain the features and functionality of your Project.
Include a demonstration video of your Project.
Prizes
$30,500 in prizes
1st Place
$12,000 in cash
1 winner
plus swag bags.
2nd Place
$7,000 in cash
1 winner
plus swag bags.
3rd Place
$3,500 in cash
1 winner
plus swag bags.
4th Place
$2,500 in cash
1 winner
plus swag bags.
5th Place
$1,500 in cash
1 winner
plus swag bags.
Social Good Award
$2,000 in cash
1 winner
plus swag bags.
All eligible submissions that address social needs.
Best Open Source Award
$2,000 in cash
1 winner
plus swag bags.
All eligible submissions that are built with open source software.
Judging Criteria
Technological Implementation (35 points)
Includes how well the idea was executed by the developer and how well the TiDB Serverless & Vector Search features were leveraged. Does the project demonstrate quality software development? How well does the project leverage all software tools used?
Quality/Creativity of the Idea (25 points)
How creative and unique is the project? Does the concept exist already? If so, how much does the project improve on it?
User Experience of the Application (20 points)
Is the user experience and visual design of the project well thought out? Is there a balanced blend of frontend and backend in the software?
Documentation Quality (10 points)
How well is the application documented for the submission?
Quality of the Demo Video (10 points)
Does the video show the app functioning on the device it was built for? Does the video include a comprehensive explanation? Is the video under 4 minutes?
Resources
Get ideas and inspiration here!
Browse our AgentX Idea List for sample projects showing how to:
Index images as vectors, full-text index PDFs, and query them with a single API call
Chain multiple LLM calls for retrieval, summarization, decision logic, and action
Use MCP (Model Context Protocol) to distribute workloads across regions or clusters
Integrate external services, for example, payment gateways, mapping APIs, email auto-senders
Explore these sample applications built with TiDB Serverless:
Smart Service Desk (vector + full-text + LLM)
AI Study Buddy (syllabus ingestion + quiz generation)
Inventory Prediction Agent (vector clustering + LLM-generated restock orders)


Example Project Ideas
Field Service Agent: Applications that ingest an image of a broken part (or a maintenance ticket), use vector search to surface similar repair manuals or past tickets, run a full-text query to find precise troubleshooting steps, and then chain a LLM call to guide a technician through each diagnostic action.
Study Companion: Applications that take a course syllabus (vectorize each section) and textbook excerpts (full-text index), answer student questions by running vector + full-text searches for context, then call a LLM to generate practice quizzes, hints, or next-reading suggestions. If the student needs to solve a math problem, the agent calls an external calculator API.
Supply Chain Orchestrator: Applications that index sales orders and inventory data in TiDB (vectors for demand patterns, full-text for product details), run vector search to predict reorder points based on historical trends, use a LLM to draft and send purchase orders automatically, and invoke an external workflow API to schedule follow-up tasks.
Customer Support Workflow: Applications that process incoming support tickets (vectorize ticket text), use vector search to find similar past tickets, run full-text search to extract relevant knowledge-base passages, and then call a LLM to compose automated, step-by-step email responses or recommended actions.
Knowledge Orchestration: Applications that ingest a variety of data sources (PDFs, CSVs, documentation) into TiDB’s vector and full-text indexes, allow a user to ask free-form questions, then combine vector + full-text results to craft detailed summaries or reports via LLM calls. These agents might also call external APIs (e.g., news feeds, charting services) to enrich the final output.
Domain Specific Copilots: Applications built for a specific vertical (legal research, medical notes, finance dashboards) that use TiDB’s search capabilities to retrieve domain documents, then chain multiple LLM calls to analyze, summarize, or generate actionable guidance. These copilots should layer on at least one external API or multi-step logic (for example, fetching a regulatory code, analyzing it, and drafting a compliance checklist).
Note: These categories are meant as inspiration only. We encourage you to build any multi-step, agentic workflow that combines TiDB’s vector/full-text search, Model Context Protocol, and LLM calls to solve a real-world problem.
We have a number of resources to help you get started building your application:
TOOLS AND TECHNOLOGIES
TiDB Serverless
Get a free TiDB Serverless Tier : TiDB Serverless is a superlight, fully managed MySQL-compatible database, offers auto-scaling, HTAP capabilities with built-in Vector Search. 
Application Developer Guide
Kimi Free 200 Million Token Resource:
Kimi, our Hackathon sponsor, is offering 200 million free tokens to every participating team. Note: Each team can only claim the token resource once.
How to Apply:
Join our Discord  
Go to the #sponsor-kimi channel  
Post a message following the required format to apply  
Once your application is approved, we’ll send your redeem code to you via Discord DM. Follow the guide below to claim your resources.
How to Claim:  
Log in to the Kimi Developer Platform → Go to Voucher Management → Select Redeem Voucher
Enter your redeem code and click Redeem
Other Resources
https://github.com/eugeneyan/open-llms
https://huggingface.co/models?other=LLM
Development tools & Sample Applications
Public datasets used for building your application
Vercel - Vercel’s frontend cloud gives developers the frameworks, workflows, and infrastructure to build a faster, more personalized web. Creator of @nextjs
Hackathon Ideas list
For open source LLMs, check out pages such as:  
ADDITIONAL RESOURCE LINKS
Learn more about TiDB:
TiDB Playground: See what TiDB is capable ONLINE
Video courses for application developers
TiDB Workshop for MySQL Users ：Learn the relation between MySQL and TiDB
Case: How does OSSInsight (a real-time analysis of over 6 billion GitHub activities) use the HTAP feature of TiDB Serverless:
Engine Smart Selection : It shows how TiDB selects row-storage or column-storage in a smart way
Data Hub for Real-time Insights : Explain the real-time analytical capability of TiDB.. 
Videos
Navigating the New GPT Store: Building a Trending GPT App in Minutes
Interactive SQL Learning with GPT: Build Your AI SQL Tutor!
Podcast: Bringing Vector Search to TiDB 
Tips & Tricks (playlist)

