import { Test, TestingModule } from '@nestjs/testing';
import { NewsGateway } from './news.gateway';

describe('NewsGateway', () => {
  let gateway: NewsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewsGateway],
    }).compile();

    gateway = module.get<NewsGateway>(NewsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
