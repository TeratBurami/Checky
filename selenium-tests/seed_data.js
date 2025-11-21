const fs = require('fs');
const path = require('path');

async function seedData() {
    const baseUrl = 'http://localhost:3000/api/v1';
    const teacherEmail = 'testteacher@gmail.com';
    const teacherPassword = 'password';
    const classCode = 'SELTTTMV'; // Hardcoded from previous run

    console.log('Starting seed data...');

    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: teacherEmail, password: teacherPassword })
    });

    if (!loginRes.ok) {
        throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
    }

    // Get cookie from response headers? 
    // Fetch in Node doesn't automatically handle cookies like browser.
    // We need to extract 'set-cookie' header and send it in subsequent requests.
    const cookie = loginRes.headers.get('set-cookie');
    console.log('Login successful, cookie obtained.');

    const headers = {
        'Content-Type': 'application/json',
        'Cookie': cookie
    };

    // 2. Get Class ID
    console.log(`Finding class with code ${classCode}...`);
    const classRes = await fetch(`${baseUrl}/class`, { headers });
    if (!classRes.ok) {
        throw new Error(`Get classes failed: ${classRes.status} ${await classRes.text()}`);
    }
    const classes = await classRes.json();
    console.log('Classes found:', JSON.stringify(classes, null, 2));
    
    // Filter by name first
    const candidateClasses = classes.filter(c => c.name === 'Selenium Test Class');
    
    let targetClassId = null;
    let targetClassCode = classCode;

    // Check details of candidates to find matching code
    for (const c of candidateClasses) {
        const detailRes = await fetch(`${baseUrl}/class/${c.classId}`, { headers });
        if (detailRes.ok) {
            const detail = await detailRes.json();
            if (detail.classCode === classCode) {
                targetClassId = c.classId;
                console.log(`Found matching class ID: ${targetClassId} for code ${classCode}`);
                break;
            }
        }
    }

    // If not found, use the latest one and update class_code.txt
    if (!targetClassId && candidateClasses.length > 0) {
        const latest = candidateClasses[candidateClasses.length - 1];
        targetClassId = latest.classId;
        console.log(`Code match not found. Using latest class ID: ${targetClassId}`);
        
        // Fetch its code
        const detailRes = await fetch(`${baseUrl}/class/${targetClassId}`, { headers });
        if (detailRes.ok) {
            const detail = await detailRes.json();
            targetClassCode = detail.classCode;
            console.log(`New class code: ${targetClassCode}`);
            fs.writeFileSync(path.resolve(__dirname, 'class_code.txt'), targetClassCode);
        }
    }

    if (!targetClassId) {
        throw new Error('No suitable class found.');
    }
    
    const classId = targetClassId;

    // 3. Create Rubric
    console.log('Creating rubric...');
    const rubricData = {
        rubric: {
            name: `Seeded Rubric ${Date.now()}`,
            criteria: [
                {
                    title: 'Content',
                    levels: [
                        { level: 'Low', score: 1, description: 'Poor content' },
                        { level: 'Medium', score: 5, description: 'Good content' },
                        { level: 'High', score: 10, description: 'Excellent content' }
                    ]
                }
            ]
        }
    };

    const rubricRes = await fetch(`${baseUrl}/rubric`, {
        method: 'POST',
        headers,
        body: JSON.stringify(rubricData)
    });

    if (!rubricRes.ok) {
        throw new Error(`Create rubric failed: ${rubricRes.status} ${await rubricRes.text()}`);
    }
    const rubricJson = await rubricRes.json();
    const rubricId = rubricJson.rubric.rubric_id; // Note: backend returns snake_case in some places, check response
    // Actually backend returns { rubric: { rubric_id, ... } } based on code reading
    console.log(`Rubric created with ID: ${rubricId}`);

    // 4. Create Assignment
    console.log('Creating assignment...');
    const assignmentData = {
        title: `Seeded Assignment ${Date.now()}`,
        description: 'This is a seeded assignment for testing.',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        rubricId: rubricId
    };

    const assignRes = await fetch(`${baseUrl}/class/${classId}/assignment`, {
        method: 'POST',
        headers,
        body: JSON.stringify(assignmentData)
    });

    if (!assignRes.ok) {
        throw new Error(`Create assignment failed: ${assignRes.status} ${await assignRes.text()}`);
    }
    const assignJson = await assignRes.json();
    console.log(`Assignment created: ${assignJson.assignment.title}`);
    
    console.log('Seed data completed successfully.');
}

seedData().catch(err => {
    console.error('Seed data failed:', err);
    process.exit(1);
});
