import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class SlugPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (value.length > 200 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      throw new BadRequestException('Slug must contain lowercase letters, numbers, and single hyphens');
    }
    return value;
  }
}
