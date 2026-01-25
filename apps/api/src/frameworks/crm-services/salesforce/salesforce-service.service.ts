import { Injectable } from '@nestjs/common';
import type { ICrmServices } from '../../../core/abstracts';
import type { Book } from '../../../core/entities';

@Injectable()
export class SalesforceService implements ICrmServices {
  bookAdded(book: Book): Promise<boolean> {
    // Implement salesforce api logic

    return Promise.resolve(true);
  }
}
