class ApiFormatter
  class << self
    def format_fields(fields)
      out = []
      fields.each do |field|
        out << {
            :name => field.name,
            :relatedness => field.relatedness,
            :field => field.code
        }
      end
      out
    end

    def format_field_name(name)
      {
          :name => name
      }
    end

    def format_response(icd, fields, type)
      {
          :data => icd,
          :fields => fields,
          :type => type
      }
    end
  end
end