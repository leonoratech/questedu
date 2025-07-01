// lib/firebase/repositories/BaseRepository.ts
import { NoRecordFoundError } from '@/lib/errors/no-record-found';
import { DocumentData, Firestore } from 'firebase-admin/firestore';
import { BaseEntity } from '../models/data-model';
import { adminDb, timestamp } from './firebase-admin';

export abstract class BaseRepository<T extends DocumentData & BaseEntity> {
  protected collectionName: string;
  protected firestore: Firestore;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.firestore = adminDb;
  }

  async getById(id: string): Promise<T> {
    const doc = await this.firestore.collection(this.collectionName).doc(id).get();
    if (!doc.exists) {
      throw new NoRecordFoundError(`Document with ID ${id} does not exist in collection ${this.collectionName}`);
    }
    const data = doc.data();
    return { ...data, id: doc.id } as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    
    const docRef = await this.firestore.collection(this.collectionName).doc(id);
    
    const updates ={
      ...data,
      updatedAt: timestamp(),
    };
    await docRef.update(updates);
    const docSnap = await docRef.get();

    if(!docSnap.exists) {
        throw new NoRecordFoundError(`Document with ID ${id} does not exist in collection for update ${this.collectionName}`);         
    }
    return docSnap.data() as T;
  }

  async create(data: T): Promise<T> {
    const docRef= await this.firestore.collection(this.collectionName).add({
      ...data,
      createdAt: timestamp(),
      updatedAt: timestamp(),
    });
    const docSnap = await docRef.get();

    if(docSnap.exists) return docSnap.data() as T;
    throw new NoRecordFoundError(`Document with ID ${docRef.id} does not exist in collection ${this.collectionName}`);   
  }

  async CreateOrUpdate(data: Partial<T>): Promise<T> {
    if (!data.id) {
      return this.create(data as T);
    } else {
      return this.update(data.id, data as Partial<T>);
    }
  }

  async createwithId(id: string, data: T): Promise<void> {
    await this.firestore.collection(this.collectionName).doc(id).set({
      ...data,
      createdAt: timestamp(),
      updatedAt: timestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    await this.firestore.collection(this.collectionName).doc(id).delete();
  }
}
