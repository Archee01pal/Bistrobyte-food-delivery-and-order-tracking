import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { MailService } from '../mail/mail.service'; // Import mail service

// Simple local replacement for missing template module
function getPasswordResetTemplate(title: string, code: string | number) {
  return `Offer: ${title}\nPasscode: ${code}\nPlease keep this code secure.`;
}

@Injectable()
export class OffersService {
  private offers = [];

  // Inject the global MailService through the constructor
  constructor(private readonly mailService: MailService) {}

  async create(createOfferDto: CreateOfferDto) {
    const newOffer = {
      id: Date.now().toString(),
      ...createOfferDto,
      claimedCount: 0,
    };

    this.offers.push(newOffer);

    // Generate secure randomized passcode string tokens
    const secureTokenCode = Math.floor(100000 + Math.random() * 900000);

    // Send the operational administrative email
    await this.mailService.sendEmail(
      'admin@churnetwork.com',
      'System Alert: New Promotional Offer Generated',
      getPasswordResetTemplate(newOffer.title, secureTokenCode)
    );

    return { message: 'Offer created successfully', offer: newOffer };
  }

  update(id: string, updateOfferDto: UpdateOfferDto) {
    // Existing Day 01 Update Code remains unchanged
    const offerIndex = this.offers.findIndex(o => o.id === id);
    if (offerIndex === -1) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
    this.offers[offerIndex] = { ...this.offers[offerIndex], ...updateOfferDto };
    return { message: 'Offer updated successfully', offer: this.offers[offerIndex] };
  }

  findAll() {
    return this.offers;
  }
}