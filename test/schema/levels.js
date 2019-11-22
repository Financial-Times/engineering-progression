'use strict';

module.exports = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	$id: 'ft-engineering-competency-levels',
	title: 'Competency Levels',
	description: 'A list of competency levels used to track career progression at the Financial Times',
	type: 'array',
	items: {
		$ref: '#/definitions/competencyLevel'
	},
	definitions: {
		competencyLevel: {
			title: 'Competency Level',
			description: 'A competency level used to help track career progression at the Financial Times',
			type: 'object',
			properties: {
				id: {
					title: 'ID',
					description: 'A unique identifier for the competency level',
					type: 'string',
					minLength: 2,
					pattern: '^([a-z\\d]+)(-[a-z\\d]+)*$'
				},
				name: {
					title: 'Name',
					description: 'A human-readable name for the competency level',
					type: 'string',
					minLength: 5
				},
				summary: {
					title: 'Summary',
					description: 'A short summary of the competency level',
					type: 'string',
					minLength: 5
				}
			},
			required: [
				'id',
				'name',
				'summary'
			],
			additionalProperties: false
		}
	}
};
