const { VISIBILITY_BY_ROLE, TRANSITIONS } = require('./server/config/workflowRules');

console.log('--- Workflow Rules Verification ---');

const roles = ['department', 'hod', 'principal', 'vice_principal', 'office'];

roles.forEach(role => {
    console.log(`Role: ${role}`);
    console.log(`  Allowed Statuses: ${JSON.stringify(VISIBILITY_BY_ROLE[role])}`);
});

console.log('\n--- Transition Rules Verification ---');
Object.keys(TRANSITIONS).forEach(status => {
    console.log(`Status: ${status}`);
    console.log(`  Allowed Transitions: ${JSON.stringify(TRANSITIONS[status])}`);
});

// Logic simulation
function canTransition(current, next) {
    return TRANSITIONS[current] && TRANSITIONS[current].includes(next);
}

console.log('\n--- Transition Simulation ---');
console.log(`DRAFT -> PENDING: ${canTransition('DRAFT', 'PENDING')}`);
console.log(`PENDING -> HOD_VERIFIED: ${canTransition('PENDING', 'HOD_VERIFIED')}`);
console.log(`HOD_VERIFIED -> MANAGEMENT_APPROVED: ${canTransition('HOD_VERIFIED', 'MANAGEMENT_APPROVED')}`);
console.log(`MANAGEMENT_APPROVED -> ALLOCATED: ${canTransition('MANAGEMENT_APPROVED', 'ALLOCATED')}`);
console.log(`MANAGEMENT_APPROVED -> FINALIZED: ${canTransition('MANAGEMENT_APPROVED', 'FINALIZED')}`);
console.log(`DRAFT -> FINALIZED: ${canTransition('DRAFT', 'FINALIZED')}`); // Should be false
