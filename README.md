# QuantFolio

**A Personal Portfolio Management and Quantitative Finance Platform**

QuantFolio is a web application designed to help users create, manage, and analyze investment portfolios. The goal is to combine portfolio tracking with quantitative finance concepts to provide insights into portfolio performance, risk, and projected growth.

## Features

- **User Authentication** — Secure user sign-up and login.
- **Dashboard** — A central interface for navigating portfolio-related features.
- **Portfolio Management** — Create and manage personal investment portfolios.
- **Manual Portfolio Creation** — Add selected stocks and other supported assets to a custom portfolio.
- **Portfolio Analysis** — Explore portfolio performance, risk, and asset allocation.
- **Growth Projections** — Planned tools to estimate potential portfolio growth using financial models.

*Note: Features are under active development. Availability and completeness may vary.*

## Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Better Auth
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Package Manager:** npm

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- PostgreSQL or a compatible configured database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Nitesh-Kukreti/QuantFolio.git
   cd QuantFolio
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables.

   Create a local `.env` file using the project's environment configuration as a reference. Set the required database connection string, authentication secret, and other environment variables.

4. Set up the database and Prisma according to the project's configuration and migrations.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

*The exact environment variables and database setup commands depend on the current project configuration.*

## Project Status

QuantFolio is currently under active development. The application is being built incrementally, with the aim of expanding from core authentication and portfolio management into more advanced quantitative analysis.

## Future Improvements

- Real-time or periodically updated market data
- Portfolio performance visualization
- Risk and return metrics
- Asset allocation analysis
- Historical portfolio backtesting
- Quantitative growth projections
- Strategy creation and comparison

## License

A license has not yet been specified. Any third-party code and its applicable license terms remain subject to their original requirements.
