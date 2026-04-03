export async function findOne({
  model,
  filter = {},
  select = "",
  sort,
  isPopulated = false,
  populatedField,
}) {
  let result;

  if (isPopulated) {
    result = await model
      .findOne(filter)
      .select(select)
      .sort(sort)
      .populate(populatedField);
  } else {
    result = await model.findOne(filter).select(select).sort(sort);
  }

  return result;
}
export async function find({
  model,
  filter = {},
  select = "",
  sort,
  isPopulated = false,
  populatedField,
}) {
  let result;

  if (isPopulated) {
    result = await model
      .find(filter)
      .select(select)
      .sort(sort)
      .populate(populatedField);
  } else {
    result = await model.find(filter).select(select).sort(sort);
  }

  return result;
}

export async function create({ model, data, options }) {
  const [result] = await model.create([data], options);
  return result;
}

export async function findById({
  model,
  _id = "",
  select = "",
  sort,
  isPopulated = false,
  populatedField,
}) {
  let result;

  if (isPopulated) {
    result = await model
      .findById(_id)
      .select(select)
      .sort(sort)
      .populate(populatedField);
  } else {
    result = await model.findById(_id).select(select).sort(sort);
  }

  return result;
}

export async function updateOne({ model, filter, data, options }) {
  return await model.updateOne(filter, data, options);
}

export async function deleteOne({ model, filter, options }) {
  return await model.deleteOne(filter, options);
}
