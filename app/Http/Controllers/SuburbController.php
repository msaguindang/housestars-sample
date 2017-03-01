<?php

namespace App\Http\Controllers;

use App\Category;
use App\Property;
use App\Suburbs;
use App\User;
use App\UserMeta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Sentinel;
use Response;

class SuburbController extends Controller
{
    protected $payload;

    public function __construct(Request $request)
    {
        $this->payload = $request;
    }

    public function getAllSuburbs()
    {
        $pageNo = $this->payload->input('page_no');

        if(!$pageNo){
            $pageNo = 1;
        }

        $limit = $this->payload->input('limit');

        if(!$limit){
            $limit = 10;
        }

        $offset = $limit*($pageNo-1);

        $suburbsLength = DB::table('suburbs')->selectRaw('count(*) as length')->first()->length;

        $suburbsSql = "SELECT * FROM suburbs LIMIT {$limit} OFFSET {$offset}";
        $suburbs = json_decode(json_encode(DB::select($suburbsSql)),TRUE);

        $response = [
            'suburbs' => $suburbs,
            'length' => $suburbsLength
        ];

        return Response::json($response, 200);
    }

    public function getSuburbAgents()
    {
        $suburbId = $this->payload->id;
        $suburbName = $this->payload->name;

        $userMetas = UserMeta::where('user_meta.meta_name', 'positions')
            ->join('users', 'users.id','=','user_meta.user_id')
            ->where('user_meta.meta_value', 'LIKE', '%'.$suburbId.'%')
            ->select('user_meta.*', 'users.name')
            ->get()
            ->toArray();

        $response = [
            'id' => $suburbId,
            'name' => $suburbName,
            'user_metas' => $userMetas
        ];

        return Response::json($response, 200);
    }

    public function deleteSuburbAgent()
    {
        $userMeta = $this->payload->input('user_meta');
        $currentSuburb = $this->payload->input('current_suburb');
        $userMetaId = $userMeta['id'];

        $userId = $userMeta['user_id'];
        $suburbKeyCombo = $currentSuburb['id'].$currentSuburb['name'];

        /*UserMeta::where('user_id', $userId)
            ->where('meta_name','positions')
            ->where('meta_value', 'LIKE', '%'.$suburbKeyCombo.'%')*/

        $currentUserMeta = UserMeta::find($userMetaId);

        $metaValue = $currentUserMeta->meta_value;

        $newMetaValue = str_replace($suburbKeyCombo, '', $metaValue);
        $metaValues = explode(',', $newMetaValue);

        $newMetaValues = [];

        foreach($metaValues as $value){
            if(trim($value) != "" && $value != null){
                $newMetaValues[] = $value;
            }
        }

        $currentUserMeta->meta_value = implode(',',$newMetaValues);
        $currentUserMeta->save();

        $response = [
            'user_meta' => $userMeta,
            'current_suburb' => $currentSuburb
        ];

        return Response::json($response, 200);
    }
}
