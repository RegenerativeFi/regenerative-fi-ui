import Service from '../../balancer-subgraph.service';
import queryBuilder from './query';
import { QueryBuilder } from '@/types/subgraph';

export default class Balancers {
  service: Service;
  query: QueryBuilder;

  constructor(service: Service, query: QueryBuilder = queryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<any> {
    const query = this.query(args, attrs);
    const balancers = await this.service.client.get(query);
    return balancers;
  }
}
