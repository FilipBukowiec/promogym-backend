import { Injectable } from '@nestjs/common';
import { Advertisement } from './advertisement.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateAdvertisementDto } from './create-advertiesment.dto';

@Injectable()
export class AdvertisementService {

    constructor(@InjectModel(Advertisement.name) private advertisementModel: Model<Advertisement>){}

     async upload(createAdvertisementDto: CreateAdvertisementDto): Promise<Advertisement> {
        await this.advertisementModel.updateMany(  
           
            { $inc: { order: 1 } }
        );
        const newAdvertisement = new this.advertisementModel({ ...createAdvertisementDto, order: 1 });
    return newAdvertisement.save();
}
}