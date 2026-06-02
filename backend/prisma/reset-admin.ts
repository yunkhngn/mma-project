import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

async function run() {
  console.log('Initializing Firebase Admin SDK...');
  const filePath = path.resolve(__dirname, '../serviceAccountKey.json');
  if (!fs.existsSync(filePath)) {
    console.error('Error: serviceAccountKey.json not found at ' + filePath);
    process.exit(1);
  }
  const serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const email = 'admin@mma.com';
  const password = 'admin123';

  console.log(`Checking if user ${email} exists in Firebase Auth...`);
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`User found (UID: ${userRecord.uid}). Updating password to "${password}"...`);
    await admin.auth().updateUser(userRecord.uid, {
      password: password,
    });
    console.log(`✅ Password successfully updated to: ${password}`);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log(`User not found. Creating user ${email}...`);
      const userRecord = await admin.auth().createUser({
        email,
        emailVerified: true,
        password,
        displayName: 'System Administrator',
      });
      console.log(`✅ User successfully created (UID: ${userRecord.uid}) with password: ${password}`);
    } else {
      console.error('❌ Error updating/creating user in Firebase Auth:', error);
    }
  }
}

run().catch(console.error);
