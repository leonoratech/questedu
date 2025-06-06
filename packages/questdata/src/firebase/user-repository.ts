import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    QueryDocumentSnapshot,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import {
    CreateUserData,
    OperationResult,
    QueryResult,
    UpdateUserData,
    User,
    UserQueryOptions,
    UserSearchCriteria
} from '../domain';
import { IUserRepository } from '../repositories';
import { FirebaseAppManager } from './app-manager';

const COLLECTION_NAME = 'users';

/**
 * Firebase implementation of the user repository
 */
export class FirebaseUserRepository implements IUserRepository {
    private appManager = FirebaseAppManager.getInstance();

    private get db() {
        return this.appManager.getDb();
    }

    private get enableLogging() {
        return this.appManager.getConfig().environment.enableDebugLogging;
    }

    private log(message: string, ...args: any[]) {
        if (this.enableLogging) {
            console.log(`[FirebaseUserRepository] ${message}`, ...args);
        }
    }

    private error(message: string, error: any) {
        console.error(`[FirebaseUserRepository] ${message}`, error);
    }

    /**
     * Convert Firestore document to User model
     */
    private documentToUser(doc: QueryDocumentSnapshot): User {
        const data = doc.data();
        return {
            id: doc.id,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
            role: data.role,
            isActive: data.isActive,
            profileComplete: data.profileComplete,
            bio: data.bio,
            expertise: data.expertise,
            location: data.location,
            socialLinks: data.socialLinks,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            lastLoginAt: data.lastLoginAt
        };
    }

    async getAll(options?: UserQueryOptions): Promise<QueryResult<User>> {
        try {
            this.log('Fetching all users with options:', options);
            
            const usersRef = collection(this.db, COLLECTION_NAME);
            let q = query(usersRef);

            // Apply sorting
            if (options?.sortBy) {
                const direction = options.sortOrder === 'asc' ? 'asc' : 'desc';
                q = query(q, orderBy(options.sortBy, direction));
            } else {
                q = query(q, orderBy('createdAt', 'desc'));
            }

            // Apply limit
            if (options?.limit) {
                q = query(q, limit(options.limit));
            }

            const querySnapshot = await getDocs(q);
            const users = querySnapshot.docs.map(doc => this.documentToUser(doc));

            this.log(`Successfully fetched ${users.length} users`);

            return {
                data: users,
                total: users.length,
                hasMore: options?.limit ? users.length === options.limit : false
            };
        } catch (error) {
            this.error('Error fetching users:', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getById(id: string): Promise<User | null> {
        try {
            this.log('Fetching user by ID:', id);
            
            const userDoc = doc(this.db, COLLECTION_NAME, id);
            const docSnap = await getDoc(userDoc);

            if (docSnap.exists()) {
                const user = this.documentToUser(docSnap as QueryDocumentSnapshot);
                this.log('Successfully fetched user:', user.displayName);
                return user;
            } else {
                this.log('User not found with ID:', id);
                return null;
            }
        } catch (error) {
            this.error('Error fetching user by ID:', error);
            return null;
        }
    }

    async getByEmail(email: string): Promise<User | null> {
        try {
            this.log('Fetching user by email:', email);
            
            const usersRef = collection(this.db, COLLECTION_NAME);
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const user = this.documentToUser(querySnapshot.docs[0]);
                this.log('Successfully fetched user by email:', user.displayName);
                return user;
            } else {
                this.log('User not found with email:', email);
                return null;
            }
        } catch (error) {
            this.error('Error fetching user by email:', error);
            return null;
        }
    }

    async search(criteria: UserSearchCriteria, options?: UserQueryOptions): Promise<QueryResult<User>> {
        try {
            this.log('Searching users with criteria:', criteria);
            
            const usersRef = collection(this.db, COLLECTION_NAME);
            let q = query(usersRef);

            // Apply search filters
            if (criteria.role) {
                q = query(q, where('role', '==', criteria.role));
            }
            if (criteria.isActive !== undefined) {
                q = query(q, where('isActive', '==', criteria.isActive));
            }
            if (criteria.location) {
                q = query(q, where('location', '==', criteria.location));
            }

            // Apply sorting
            if (options?.sortBy) {
                const direction = options.sortOrder === 'asc' ? 'asc' : 'desc';
                q = query(q, orderBy(options.sortBy, direction));
            }

            // Apply limit
            if (options?.limit) {
                q = query(q, limit(options.limit));
            }

            const querySnapshot = await getDocs(q);
            let users = querySnapshot.docs.map(doc => this.documentToUser(doc));

            // Client-side filtering for complex criteria
            if (criteria.query) {
                const searchTerm = criteria.query.toLowerCase();
                users = users.filter(user => 
                    user.displayName.toLowerCase().includes(searchTerm) ||
                    user.email.toLowerCase().includes(searchTerm) ||
                    user.bio?.toLowerCase().includes(searchTerm)
                );
            }

            if (criteria.expertise && criteria.expertise.length > 0) {
                users = users.filter(user => 
                    user.expertise?.some(exp => criteria.expertise!.includes(exp))
                );
            }

            this.log(`Successfully searched users, found ${users.length} results`);

            return {
                data: users,
                total: users.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Error searching users:', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getByRole(role: string, options?: UserQueryOptions): Promise<QueryResult<User>> {
        try {
            this.log('Fetching users by role:', role);
            
            const usersRef = collection(this.db, COLLECTION_NAME);
            let q = query(usersRef, where('role', '==', role));

            // Apply sorting
            if (options?.sortBy) {
                const direction = options.sortOrder === 'asc' ? 'asc' : 'desc';
                q = query(q, orderBy(options.sortBy, direction));
            }

            // Apply limit
            if (options?.limit) {
                q = query(q, limit(options.limit));
            }

            const querySnapshot = await getDocs(q);
            const users = querySnapshot.docs.map(doc => this.documentToUser(doc));

            this.log(`Successfully fetched ${users.length} users with role: ${role}`);

            return {
                data: users,
                total: users.length,
                hasMore: options?.limit ? users.length === options.limit : false
            };
        } catch (error) {
            this.error('Error fetching users by role:', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async create(userData: CreateUserData): Promise<OperationResult<string>> {
        try {
            this.log('Creating new user:', userData.email);
            
            const usersRef = collection(this.db, COLLECTION_NAME);
            const now = Timestamp.now();
            
            const docRef = await addDoc(usersRef, {
                ...userData,
                createdAt: now,
                updatedAt: now
            });

            this.log('Successfully created user with ID:', docRef.id);
            
            return {
                success: true,
                data: docRef.id
            };
        } catch (error) {
            this.error('Error creating user:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                code: 'USER_CREATION_FAILED'
            };
        }
    }

    async update(id: string, updateData: UpdateUserData): Promise<OperationResult<void>> {
        try {
            this.log('Updating user:', id);
            
            const userDoc = doc(this.db, COLLECTION_NAME, id);
            const now = Timestamp.now();
            
            await updateDoc(userDoc, {
                ...updateData,
                updatedAt: now
            });

            this.log('Successfully updated user:', id);
            
            return {
                success: true
            };
        } catch (error) {
            this.error('Error updating user:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                code: 'USER_UPDATE_FAILED'
            };
        }
    }

    async updateLastLogin(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Updating last login for user:', id);
            
            const userDoc = doc(this.db, COLLECTION_NAME, id);
            const now = Timestamp.now();
            
            await updateDoc(userDoc, {
                lastLoginAt: now,
                updatedAt: now
            });

            this.log('Successfully updated last login for user:', id);
            
            return {
                success: true
            };
        } catch (error) {
            this.error('Error updating last login:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                code: 'LAST_LOGIN_UPDATE_FAILED'
            };
        }
    }

    async delete(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Deleting user:', id);
            
            const userDoc = doc(this.db, COLLECTION_NAME, id);
            await deleteDoc(userDoc);

            this.log('Successfully deleted user:', id);
            
            return {
                success: true
            };
        } catch (error) {
            this.error('Error deleting user:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                code: 'USER_DELETION_FAILED'
            };
        }
    }

    subscribeToChanges(callback: (users: User[]) => void): () => void {
        this.log('Setting up real-time subscription for users');
        
        const usersRef = collection(this.db, COLLECTION_NAME);
        const q = query(usersRef, orderBy('createdAt', 'desc'));
        
        return onSnapshot(
            q,
            (querySnapshot) => {
                const users = querySnapshot.docs.map(doc => this.documentToUser(doc));
                this.log(`Real-time update: ${users.length} users`);
                callback(users);
            },
            (error) => {
                this.error('Error in users subscription:', error);
            }
        );
    }

    subscribeToSingle(id: string, callback: (user: User | null) => void): () => void {
        this.log('Setting up real-time subscription for user:', id);
        
        const userDoc = doc(this.db, COLLECTION_NAME, id);
        
        return onSnapshot(
            userDoc,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const user = this.documentToUser(docSnapshot as QueryDocumentSnapshot);
                    this.log('Real-time update for user:', user.displayName);
                    callback(user);
                } else {
                    this.log('Real-time update: user not found:', id);
                    callback(null);
                }
            },
            (error) => {
                this.error('Error in user subscription:', error);
            }
        );
    }
}
