'use strict';

// We need to get the data for levels and domains to build this schema
let validLevels = []
let validDomains = [];
try {
	validLevels = require('../../dist/levels.json');
	validDomains = require('../../dist/domains.json');
} catch (error) {}

module.exports = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	$id: 'ft-engineering-competencies',
	title: 'Competencies',
	description: 'A list of competencies used to track career progression at the Financial Times',
	type: 'array',
	items: {
		$ref: '#/definitions/competency'
	},
	definitions: {
		competency: {
			title: 'Competency',
			description: 'A competency used to help track career progression at the Financial Times',
			type: 'object',
			properties: {
				id: {
					title: 'ID',
					description: 'A unique identifier for the competency',
					type: 'string',
					minLength: 2,
					pattern: '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[1-5]{1}[a-fA-F0-9]{3}-[89abAB]{1}[a-fA-F0-9]{3}-[a-fA-F0-9]{12}'
				},
				summary: {
					title: 'Summary',
					description: 'A short summary of the competency',
					type: 'string',
					minLength: 5
				},
				description: {
					title: 'Description',
					description: 'A longer description of the competency, elaborating on and clarifying the summary',
					oneOf: [
						{
							type: 'string',
							minLength: 5
						},
						{
							type: 'null'
						}
					]
				},
				examples: {
					title: 'Examples',
					description: 'Any examples which help illustrate what\'s expected of an engineer to complete the competency',
					type: 'array',
					items: {
						type: 'string',
						minLength: 5
					}
				},
				level: {
					title: 'Level',
					description: 'The level that this competency applies to',
					type: 'string',
					enum: validLevels.map(level => level.id)
				},
				area: {
					title: 'Area',
					description: 'The area that this competency belongs to',
					type: 'string',
					enum: [
						'technical',
						'communication',
						'delivery',
						'leadership'
					]
				},
				domain: {
					title: 'Domain',
					description: 'The domain that this specific competency applies to',
					oneOf: [
						{
							type: 'string',
							enum: validDomains.map(domain => domain.id)
						},
						{
							type: 'null'
						}
					]
				}
			},
			required: [
				'id',
				'summary',
				'description',
				'examples',
				'level',
				'area',
				'domain'
			],
			additionalProperties: false
		}
	}
};
