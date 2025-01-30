'use strict';

// We need to get the data for levels to build this schema
let validLevels = []
try {
	validLevels = require('../../dist/levels.json');
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
				supportingUrls: {
					title: 'Supporting URLs',
					description: 'Any URLs which are useful in helping to understand a competency',
					type: 'array',
					items: {
						$ref: '#/definitions/supportingUrl'
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
				}
			},
			required: [
				'id',
				'summary',
				'description',
				'examples',
				'supportingUrls',
				'level',
				'area'
			],
			additionalProperties: false
		},
		supportingUrl: {
			title: 'Supporting URL',
			description: 'A URL which is useful in helping to understand a competency',
			type: 'object',
			properties: {
				label: {
					title: 'Label',
					description: 'A label which identifies the link',
					type: 'string',
					minLength: 2
				},
				url: {
					title: 'URL',
					description: 'The URL which supports the competency',
					type: 'string',
					minLength: 5,
					pattern: '^https?:\/\/'
				}
			},
			required: [
				'label',
				'url'
			],
			additionalProperties: false
		}
	}
};
