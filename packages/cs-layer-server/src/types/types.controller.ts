import { Get, Controller, Param, Post, Body, Put, Optional, Query } from '@nestjs/common';
import { FeatureType, LayerSource } from '../classes';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse
} from '@nestjs/swagger';

import { LayerService } from '../layers/layers.service';

@ApiTags()
@Controller('types')
export class TypesController {
  constructor(private readonly layerService: LayerService) { }

  @ApiOperation({
    summary: 'Get available feature types',
    description: 'Returns all available feature types'
})
  @ApiResponse({
      status: 200,
      description: 'Returns all available layer definitions.'      
  })
  @Get()
  public featuretypes(): FeatureType[] {
      return this.layerService.getTypes();      
  }

  @ApiOperation({
    summary: 'Add or update feature type',
    description: 'Add or update feature type'
  })
  @ApiParam({
    name: 'sourceid',
    required: true,
    description: 'Specify the layer/source id for the layer you want to update'
  })
  @ApiParam({
    name: 'featureid',
    required: true,
    description: 'Specify the feature id for the layer you want to update'
  })

  @ApiResponse({
    status: 200,
    description: 'Returns added feature',
    type: FeatureType
  })
  @Post()
  public postFeatureType(@Body() body: FeatureType | FeatureType[]): Promise<FeatureType | FeatureType[] | undefined> {
    if (Array.isArray(body)) {
      return this.layerService.updateFeatureTypes(body);
    } else {
      return this.layerService.updateFeatureType(body);
    }
  }


}