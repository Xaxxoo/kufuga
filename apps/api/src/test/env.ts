const sourceUrl = new URL(process.env.DATABASE_URL ?? 'postgresql://kufuga:kufuga@localhost:5432/kufuga');
sourceUrl.pathname = '/poultry_stellar_test';
process.env.DATABASE_URL = sourceUrl.toString();
