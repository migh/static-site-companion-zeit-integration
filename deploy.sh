ENV_VARS=""

for VAR in $(cat .env)
do
  ENV_VARS+=" -e $VAR"
done

echo "$ENV_VARS"
