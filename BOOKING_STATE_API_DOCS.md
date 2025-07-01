# 📚 BookingStateManager API Documentation

## Overview

`BookingStateManager` là class chính để quản lý state transitions cho booking system. Class này cung cấp methods để initialize, transition, và track booking states theo business rules đã định nghĩa.

---

## 📋 Types & Interfaces

### BookingState
```typescript
type BookingState = 
  | 'draft'
  | 'booked' 
  | 'in_progress'
  | 'departed'
  | 'completed'
  | 'cancelled';
```

### BookingStateRecord
```typescript
interface BookingStateRecord {
  id: number;
  booking_id: number;
  old_state: BookingState | null;
  current_state: BookingState;
  timestamp: string;
}
```

### TransitionResult
```typescript
interface TransitionResult {
  success: boolean;
  newState?: BookingState;
  error?: string;
}
```

### InitializeResult
```typescript
interface InitializeResult {
  success: boolean;
  error?: string;
}
```

---

## 🔄 State Transition Rules

### VALID_TRANSITIONS
```typescript
const VALID_TRANSITIONS: Record<BookingState, { action: string; nextState: BookingState; allowed: boolean }[]> = {
  draft: [
    { action: 'Start', nextState: 'in_progress', allowed: true },
    { action: 'Manual Confirm', nextState: 'booked', allowed: true },
  ],
  booked: [
    { action: 'Start', nextState: 'in_progress', allowed: true },
    { action: 'Cancel', nextState: 'cancelled', allowed: true },
  ],
  in_progress: [
    { action: 'Finish', nextState: 'departed', allowed: true },
    { action: 'Cancel', nextState: 'cancelled', allowed: true },
  ],
  departed: [
    { action: 'Finish', nextState: 'completed', allowed: true },
  ],
  completed: [],
  cancelled: [],
};
```

---

## 📖 API Methods

### getCurrentState()
Get the current state of a booking.

**Signature:**
```typescript
static async getCurrentState(bookingId: number): Promise<BookingState | null>
```

**Parameters:**
- `bookingId` (number): The ID of the booking

**Returns:**
- `Promise<BookingState | null>`: Current state or null if not found

**Example:**
```typescript
const currentState = await BookingStateManager.getCurrentState(123);
console.log(currentState); // 'draft', 'booked', etc.
```

**Error Handling:**
- Returns `'draft'` if table doesn't exist or no records found
- Logs warnings for missing table scenarios

---

### getStateHistory()
Get complete state transition history for a booking.

**Signature:**
```typescript
static async getStateHistory(bookingId: number): Promise<BookingStateRecord[]>
```

**Parameters:**
- `bookingId` (number): The ID of the booking

**Returns:**
- `Promise<BookingStateRecord[]>`: Array of state records ordered by timestamp

**Example:**
```typescript
const history = await BookingStateManager.getStateHistory(123);
history.forEach(record => {
  console.log(`${record.old_state} → ${record.current_state} at ${record.timestamp}`);
});
```

**Error Handling:**
- Returns empty array if table doesn't exist or errors occur
- Logs appropriate warnings and errors

---

### isValidTransition()
Check if a state transition is allowed.

**Signature:**
```typescript
static isValidTransition(currentState: BookingState, action: string): boolean
```

**Parameters:**
- `currentState` (BookingState): Current state of the booking
- `action` (string): The action to perform

**Returns:**
- `boolean`: True if transition is allowed, false otherwise

**Example:**
```typescript
const isValid = BookingStateManager.isValidTransition('draft', 'Start');
console.log(isValid); // true
```

---

### getValidActions()
Get list of valid actions for current state.

**Signature:**
```typescript
static getValidActions(currentState: BookingState): string[]
```

**Parameters:**
- `currentState` (BookingState): Current state of the booking

**Returns:**
- `string[]`: Array of valid action names

**Example:**
```typescript
const actions = BookingStateManager.getValidActions('draft');
console.log(actions); // ['Start', 'Manual Confirm']
```

---

### transitionState()
Transition booking to a new state.

**Signature:**
```typescript
static async transitionState(
  bookingId: number, 
  action: string, 
  userId?: number
): Promise<TransitionResult>
```

**Parameters:**
- `bookingId` (number): The ID of the booking
- `action` (string): The action to perform
- `userId` (number, optional): ID of user performing the action

**Returns:**
- `Promise<TransitionResult>`: Result object with success status, new state, or error

**Example:**
```typescript
const result = await BookingStateManager.transitionState(123, 'Start');
if (result.success) {
  console.log('New state:', result.newState);
} else {
  console.error('Error:', result.error);
}
```

**Error Handling:**
- Validates current state before transition
- Checks if transition is allowed
- Returns detailed error messages for debugging

---

### initializeBooking()
Initialize a new booking with draft state.

**Signature:**
```typescript
static async initializeBooking(bookingId: number): Promise<InitializeResult>
```

**Parameters:**
- `bookingId` (number): The ID of the booking to initialize

**Returns:**
- `Promise<InitializeResult>`: Result object with success status or error

**Example:**
```typescript
const result = await BookingStateManager.initializeBooking(123);
if (result.success) {
  console.log('Booking initialized successfully');
} else {
  console.error('Error:', result.error);
}
```

**Error Handling:**
- Returns success even if table doesn't exist (for demo purposes)
- Logs appropriate warnings and errors

---

### getStateDisplayInfo()
Get display information for UI rendering.

**Signature:**
```typescript
static getStateDisplayInfo(state: BookingState): StateDisplayInfo
```

**Parameters:**
- `state` (BookingState): The state to get display info for

**Returns:**
- `StateDisplayInfo`: Object with label, color, icon, and description

**Example:**
```typescript
const info = BookingStateManager.getStateDisplayInfo('in_progress');
console.log(info);
// {
//   label: 'In Progress',
//   color: 'bg-orange-100 text-orange-800',
//   icon: '🚗',
//   description: 'Vehicle wash is in progress'
// }
```

---

## 🎨 State Display Information

### State Colors & Icons
```typescript
const stateInfo = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    icon: '📝',
    description: 'Booking is being prepared'
  },
  booked: {
    label: 'Booked',
    color: 'bg-blue-100 text-blue-800',
    icon: '📅',
    description: 'Booking is confirmed and scheduled'
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-orange-100 text-orange-800',
    icon: '🚗',
    description: 'Vehicle wash is in progress'
  },
  departed: {
    label: 'Departed',
    color: 'bg-purple-100 text-purple-800',
    icon: '🚙',
    description: 'Vehicle has left the wash bay'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: '✅',
    description: 'Service completed successfully'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: '❌',
    description: 'Booking was cancelled'
  }
};
```

---

## 🔧 Error Handling

### Common Error Scenarios

1. **Table Not Found**:
   - Returns default values instead of throwing errors
   - Logs warnings for debugging
   - Allows app to continue functioning

2. **Foreign Key Constraint**:
   - Validates booking exists before creating states
   - Returns descriptive error messages

3. **Invalid Transitions**:
   - Validates transitions before attempting database operations
   - Returns clear error messages about why transition failed

4. **Database Connection Issues**:
   - Graceful fallback behavior
   - Detailed error logging

### Error Response Format
```typescript
{
  success: false,
  error: "Human-readable error message"
}
```

---

## 📊 Usage Patterns

### Complete Workflow Example
```typescript
// 1. Initialize new booking
const booking = await createBooking(customerData);
await BookingStateManager.initializeBooking(booking.id);

// 2. Confirm booking
const confirmResult = await BookingStateManager.transitionState(
  booking.id, 
  'Manual Confirm'
);

// 3. Start service
const startResult = await BookingStateManager.transitionState(
  booking.id, 
  'Start'
);

// 4. Complete service
const finishResult = await BookingStateManager.transitionState(
  booking.id, 
  'Finish'
);

const completeResult = await BookingStateManager.transitionState(
  booking.id, 
  'Finish'
);

// 5. Get final history
const history = await BookingStateManager.getStateHistory(booking.id);
```

### React Component Integration
```typescript
const [currentState, setCurrentState] = useState<BookingState>('draft');
const [validActions, setValidActions] = useState<string[]>([]);

useEffect(() => {
  const loadState = async () => {
    const state = await BookingStateManager.getCurrentState(bookingId);
    setCurrentState(state);
    setValidActions(BookingStateManager.getValidActions(state));
  };
  loadState();
}, [bookingId]);

const handleTransition = async (action: string) => {
  const result = await BookingStateManager.transitionState(bookingId, action);
  if (result.success) {
    setCurrentState(result.newState!);
    setValidActions(BookingStateManager.getValidActions(result.newState!));
  } else {
    alert(result.error);
  }
};
```

---

## 🚀 Performance Considerations

### Database Indexes
Ensure these indexes exist for optimal performance:
```sql
CREATE INDEX "idx_booking_state_booking_id" ON "booking_state" ("booking_id");
CREATE INDEX "idx_booking_state_current_state" ON "booking_state" ("current_state");
CREATE INDEX "idx_booking_state_timestamp" ON "booking_state" ("timestamp");
```

### Query Optimization
- `getCurrentState()` uses `LIMIT 1` for efficiency
- `getStateHistory()` orders by timestamp for proper sequencing
- Foreign key constraints ensure data integrity

---

## 🔒 Security Considerations

### RLS (Row Level Security)
For production, enable RLS with appropriate policies:
```sql
ALTER TABLE booking_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow operations for authenticated users" 
ON booking_state 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
```

### User Permissions
Consider adding user ID tracking:
- Add `created_by` field to track who made state changes
- Implement role-based access control for state transitions
- Audit logging for compliance requirements

---

*Documentation generated: July 1, 2025*  
*Version: 1.0*  
*Status: Production Ready*
