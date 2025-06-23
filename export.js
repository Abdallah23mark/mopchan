import { Client } from 'pg';
import fs from 'fs/promises';

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_x6urLldJU9Qn@ep-spring-bonus-ad31vd3y.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

(async () => {
  await client.connect();
  const tables = await client.query(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `);

  const dump = {};
  for (const row of tables.rows) {
    const tableName = row.tablename;
    const data = await client.query(`SELECT * FROM ${tableName}`);
    dump[tableName] = data.rows;
  }

  await fs.writeFile('dump.json', JSON.stringify(dump, null, 2));
  await client.end();
  console.log('✅ Database dumped to dump.json');
})();
